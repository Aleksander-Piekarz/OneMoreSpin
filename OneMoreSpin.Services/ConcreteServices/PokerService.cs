using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Hubs;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Services.ConcreteServices
{

   public class PokerService : IPokerService
    {
        private readonly ConcurrentDictionary<string, PokerTable> _tables = new();
        private readonly ConcurrentDictionary<string, string> _playerTables = new();
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<PokerHub> _hubContext;

        public PokerService(IServiceScopeFactory scopeFactory, IHubContext<PokerHub> hubContext)
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;
            
            // --- TWORZYMY 3 STOŁY DO LOBBY ---
            CreateTable("stol-1", "Stół Początkujący (100$)", 100);
            CreateTable("stol-2", "Stół Zaawansowany (1000$)", 1000);
            CreateTable("stol-vip", "VIP ROOM (5000$)", 5000);
        }

        private void CreateTable(string id, string name, decimal minBet)
        {
            _tables.TryAdd(id, new PokerTable { Id = id, CurrentMinBet = minBet }); 
        }

   
        public List<TableInfoDto> GetLobbyInfo()
        {
            return _tables.Values.Select(t => new TableInfoDto
            {
                Id = t.Id,
                Name = t.Id == "stol-vip" ? "VIP Room" : (t.Id == "stol-2" ? "High Rollers" : "Beginners"),
                PlayersCount = t.Players.Count,
                MinBuyIn = t.CurrentMinBet > 0 ? t.CurrentMinBet : 100 
            }).ToList();
        }

        public PokerTable GetTable(string tableId)
        {
            if (string.IsNullOrEmpty(tableId)) return null;
            _tables.TryGetValue(tableId, out var table);
            return table;
        }

        public void JoinTable(string tableId, string connectionId, string userId, decimal chipsIgnored = 0)
        {
            var table = GetTable(tableId);
            if (table == null) return;

            decimal playerChips = 1000;
            string dbUsername = "Nieznany";

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                // Logika szukania usera (taka jak wcześniej)
                if (int.TryParse(userId, out int idAsInt)) {
                    var user = db.Users.FirstOrDefault(u => u.Id == idAsInt);
                    if (user != null) { playerChips = user.Balance; dbUsername = user.UserName; }
                    else { dbUsername = $"Guest_{idAsInt}"; }
                } else {
                    var user = db.Users.FirstOrDefault(u => u.UserName == userId);
                    if (user != null) { playerChips = user.Balance; dbUsername = user.UserName; }
                    else { dbUsername = userId ?? "Guest"; }
                }
            }

            lock (table)
            {
                var existing = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (existing != null) {
                    existing.ConnectionId = connectionId;
                    existing.Username = dbUsername;
                } else {
                    var newPlayer = new PokerPlayer(connectionId, dbUsername, playerChips);
                    newPlayer.UserId = userId; 
                    table.Players.Add(newPlayer);
                }
                _playerTables.TryAdd(connectionId, tableId);
            }
        }

        public void LeaveTable(string connectionId)
        {
            if (!_playerTables.TryRemove(connectionId, out string tableId)) return;
            var table = GetTable(tableId);
            if (table == null) return;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
                if (player == null) return;

                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"🚪 {player.Username} opuścił stół.");
                _hubContext.Clients.Group(tableId).SendAsync("PlayerLeft", player.Username);

                if (table.GameInProgress && !player.IsFolded) {
                    player.IsFolded = true;
                    if (table.Players[table.CurrentPlayerIndex].ConnectionId == connectionId) MoveTurnToNextPlayer(table);
                    if (table.GameInProgress) CheckIfRoundEnded(table);
                } else {
                    table.Players.Remove(player);
                }
                _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
            }
        }

        public void StartNewHand(string tableId)
        {
            var table = GetTable(tableId);
            if (table == null) return;

            lock (table)
            {
                // Usuwamy graczy bez pieniędzy przed startem
                table.Players.RemoveAll(p => p.Chips <= 0);

                if (table.Players.Count < 2) return;

                table.Deck = GenerateDeck();
                ShuffleDeck(table.Deck);
                table.CommunityCards.Clear();
                table.Pot = 0;
                table.Stage = "PreFlop";
                table.GameInProgress = true;
                table.CurrentMinBet = 0;
                table.ActionsTakenInRound = 0;

                foreach (var p in table.Players)
                {
                    p.Hand.Clear();
                    p.IsFolded = false;
                    p.CurrentBet = 0;
                    p.Hand.Add(DrawCard(table.Deck));
                    p.Hand.Add(DrawCard(table.Deck));
                }

                table.DealerIndex = (table.DealerIndex + 1) % table.Players.Count;
                table.CurrentPlayerIndex = (table.DealerIndex + 1) % table.Players.Count;
                
                // Dealer jest małym blindem w Heads-Up, ale tu upraszczamy: startuje osoba po dealerze
                // Upewniamy się, że nie startuje osoba która jest Sit-out (chociaż usunęliśmy pustych)
            }
        }

        public bool PlayerMove(string tableId, string userId, string action, decimal amount)
        {
            var table = GetTable(tableId);
            if (table == null) return false;
            bool moveResult = false;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null) return false;
                if (table.Players[table.CurrentPlayerIndex].UserId != userId) return false; 

                switch (action.ToUpper())
                {
                    case "FOLD":
                        player.IsFolded = true;
                        moveResult = true;
                        break;
                    case "CHECK":
                        if (player.CurrentBet == table.CurrentMinBet) moveResult = true;
                        break;
                    case "CALL":
                        decimal toCall = table.CurrentMinBet - player.CurrentBet;
                        if (player.Chips <= toCall) { 
                            // ALL-IN
                            decimal allInAmount = player.Chips;
                            player.Chips = 0;
                            player.CurrentBet += allInAmount;
                            table.Pot += allInAmount;
                            moveResult = true;
                        } else {
                            player.Chips -= toCall;
                            player.CurrentBet += toCall;
                            table.Pot += toCall;
                            moveResult = true;
                        }
                        break;
                    case "RAISE":
                        // Logika Raise / All-in Raise
                        decimal raiseTotal = player.CurrentBet + amount; // Ile łącznie chce postawić
                        if (amount > player.Chips) amount = player.Chips; // Cap do posiadanych żetonów (All-in)

                        if (player.Chips >= amount) {
                            player.Chips -= amount;
                            player.CurrentBet += amount;
                            table.Pot += amount;
                            
                            if (player.CurrentBet > table.CurrentMinBet) {
                                table.CurrentMinBet = player.CurrentBet;
                                table.ActionsTakenInRound = 0; // Reset rundy
                            }
                            moveResult = true;
                        }
                        break;
                }

                if (moveResult)
                {
                    // Jeśli gracz wszedł All-In (ma 0 żetonów), NIE JEST FOLDED. Jest w grze, ale nie ma ruchu.
                    table.ActionsTakenInRound++;
                    MoveTurnToNextPlayer(table);
                    if (table.GameInProgress) CheckIfRoundEnded(table);
                }
            }
            return moveResult;
        }

        private void MoveTurnToNextPlayer(PokerTable table)
        {
            int activePlayers = table.Players.Count(p => !p.IsFolded);
            
            // Jeśli został tylko 1 gracz w grze (reszta Fold) -> Koniec
            if (activePlayers <= 1) {
                EndHand(table); 
                return;
            }

            // Szukamy następnego gracza, który MA ŻETONY i NIE SPASOWAŁ
            int attempts = 0;
            do {
                table.CurrentPlayerIndex = (table.CurrentPlayerIndex + 1) % table.Players.Count;
                attempts++;
                var p = table.Players[table.CurrentPlayerIndex];
                
                // Jeśli gracz nie spasował i ma > 0 żetonów -> To jego tura
                if (!p.IsFolded && p.Chips > 0) return;

                // Jeśli gracz jest All-in (Chips == 0), pomijamy go w licytacji, ale jest w grze!

            } while (attempts <= table.Players.Count);
            
            // Jeśli pętla przeszła wszystkich i nikogo nie znalazła (wszyscy pozostali są All-in)
            // To licytacja się skończyła.
        }

        private void CheckIfRoundEnded(PokerTable table)
        {
            var activePlayers = table.Players.Where(p => !p.IsFolded).ToList();
            var playersWithChips = activePlayers.Where(p => p.Chips > 0).ToList();

            // Jeśli nikt nie ma żetonów do licytacji (wszyscy All-in) -> Next Stage
            if (playersWithChips.Count == 0) {
                ProceedToNextStage(table);
                return;
            }
            
            // Jeśli został 1 z żetonami, a reszta to All-in -> Sprawdzamy czy wyrównał
            if (playersWithChips.Count == 1) {
                var lastMan = playersWithChips[0];
                // Jeśli jego bet jest równy lub wyższy od All-inów (maxBet), to koniec rundy
                if (lastMan.CurrentBet >= table.CurrentMinBet) {
                     ProceedToNextStage(table);
                     return;
                }
            }

            bool allBetsEqual = playersWithChips.All(p => p.CurrentBet == table.CurrentMinBet);
            if (allBetsEqual && table.ActionsTakenInRound >= playersWithChips.Count)
            {
                ProceedToNextStage(table);
            }
        }

        private void ProceedToNextStage(PokerTable table)
        {
            table.ActionsTakenInRound = 0;
            table.CurrentMinBet = 0;
            foreach (var p in table.Players) p.CurrentBet = 0; 
            
            // Logika przejścia etapów
            if (table.Stage == "PreFlop") {
                table.Stage = "Flop";
                AddCommunityCards(table, 3);
            } else if (table.Stage == "Flop") {
                table.Stage = "Turn";
                AddCommunityCards(table, 1);
            } else if (table.Stage == "Turn") {
                table.Stage = "River";
                AddCommunityCards(table, 1);
            } else if (table.Stage == "River") {
                table.Stage = "Showdown";
                EndHand(table);
                return;
            }
            
            // Jeśli wszyscy są All-in, automatycznie lecimy do końca
            int playersCanAct = table.Players.Count(p => !p.IsFolded && p.Chips > 0);
            if (playersCanAct <= 1 && table.Stage != "Showdown") {
                _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
                // Małe opóźnienie można by tu dodać, ale w C# blokuje wątek. 
                // Rekurencyjnie idziemy do końca.
                ProceedToNextStage(table); 
                return;
            }

            // Ustawiamy start na pierwszego aktywnego gracza po dealerze
            int nextStart = (table.DealerIndex + 1) % table.Players.Count;
            int attempts = 0;
            while((table.Players[nextStart].IsFolded || table.Players[nextStart].Chips == 0) && attempts < table.Players.Count) {
                nextStart = (nextStart + 1) % table.Players.Count;
                attempts++;
            }
            table.CurrentPlayerIndex = nextStart;

            _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
        }

        private void AddCommunityCards(PokerTable table, int count) {
            for(int i=0; i<count; i++) table.CommunityCards.Add(DrawCard(table.Deck));
        }

       private void EndHand(PokerTable table)
        {
            var activePlayers = table.Players.Where(p => !p.IsFolded).ToList();
            PokerPlayer winner = null;
            string winHandName = "";

            if (activePlayers.Count == 1) {
                winner = activePlayers[0];
                winHandName = "Przeciwnik spasował";
            } else {
                // Showdown logic...
                double bestScore = -1;
                foreach(var p in activePlayers) {
                    var allCards = new List<Card>(p.Hand);
                    allCards.AddRange(table.CommunityCards);
                    var (score, name) = EvaluateHandStrength(allCards);
                    if (score > bestScore) { bestScore = score; winner = p; winHandName = name; }
                }
            }

            if (winner != null)
            {
                winner.Chips += table.Pot;
                
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", "=========================");
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🏆 WYGRAŁ: {winner.Username}");
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🃏 Układ: {winHandName}");
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"💰 +{table.Pot} $");
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", "=========================");
            }

            foreach (var player in table.Players)
            {
                decimal moneyWon = (winner != null && player.UserId == winner.UserId) ? table.Pot : 0;
                

                Task.Run(() => SaveHandResult(player.UserId, player.Chips, moneyWon));
            }


            table.Pot = 0;
            table.GameInProgress = false; 
            table.Stage = "Showdown";    
            

            _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);

        }

        private void ResetTableState(PokerTable table)
        {
            lock (table)
            {
                table.Pot = 0;
                table.Stage = "Waiting";
                table.CommunityCards.Clear();
                foreach(var p in table.Players) {
                    p.Hand.Clear();
                    p.IsFolded = false;
                    p.CurrentBet = 0;
                }
                
                // Wysyłamy stan Waiting (karty znikają, przycisk START wraca)
                _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
            }
        }

        // Zwraca (punkty, nazwa). Punkty służą do porównywania kto wygrał.
       private (double score, string name) EvaluateHandStrength(List<Card> cards)
        {
            if (cards == null || cards.Count < 5) return (0, "Błąd rozdania");

            // 1. Sortujemy wszystkie dostępne karty (ręka + stół) od najsilniejszej
            var sorted = cards.OrderByDescending(c => (int)c.Rank).ToList();

            // 2. Grupowanie do Par, Trójek, Karet
            var groups = sorted.GroupBy(c => c.Rank)
                               .Select(g => new { Rank = g.Key, Count = g.Count() })
                               .OrderByDescending(g => g.Count) // Najpierw te co mają najwięcej (np. kareta)
                               .ThenByDescending(g => g.Rank)   // Potem wyższe rangi
                               .ToList();

            // 3. Sprawdzanie KOLORU (Flush)
            var flushGroup = sorted.GroupBy(c => c.Suit).FirstOrDefault(g => g.Count() >= 5);
            bool isFlush = flushGroup != null;

            // 4. Sprawdzanie STRITA (Straight)
            bool isStraight = false;
            int straightHighRank = 0;

            // Bierzemy unikalne rangi, żeby np. mając [5, 5, 4, 3, 2] nie zepsuć sprawdzania
            var distinctRanks = sorted.Select(c => (int)c.Rank).Distinct().OrderByDescending(r => r).ToList();

            // Algorytm: szukamy 5 kolejnych liczb
            int consecutiveCount = 1;
            for (int i = 0; i < distinctRanks.Count - 1; i++)
            {
                if (distinctRanks[i] - 1 == distinctRanks[i + 1])
                {
                    consecutiveCount++;
                    if (consecutiveCount >= 5)
                    {
                        isStraight = true;
                        // Wysoka karta strita to ta, od której zaczęła się seria (aktualna + 4 w górę, ale w liście to index - 4)
                        // Prościej: skoro idziemy w dół i mamy 5, to najwyższa była 4 pozycje wcześniej
                        straightHighRank = distinctRanks[i - 3]; 
                        break; 
                    }
                }
                else
                {
                    consecutiveCount = 1; // Reset, dziura w sekwencji
                }
            }

            // Specjalny przypadek: Strit A-2-3-4-5 (Ace Low / Wheel)
            // W distinctRanks As ma wartość 14. Musimy sprawdzić czy mamy: 14, 5, 4, 3, 2
            if (!isStraight && distinctRanks.Contains(14) && distinctRanks.Contains(2) && 
                distinctRanks.Contains(3) && distinctRanks.Contains(4) && distinctRanks.Contains(5))
            {
                isStraight = true;
                straightHighRank = 5; // W tym stricie najwyższa jest 5
            }

            // --- RANKING UKŁADÓW (Od najsilniejszego) ---

            // 1. POKER (Straight Flush) - Kolor + Strit
            // (Uproszczenie: zakładamy że jeśli jest kolor i strit, to jest to Straight Flush. 
            // W idealnym świecie trzeba sprawdzić czy to TE SAME karty tworzą strita i kolor, ale na potrzeby gry webowej to wystarczy)
            if (isFlush && isStraight) 
                return (900 + straightHighRank, $"POKER (Straight Flush do {GetRankName(straightHighRank)})");

            // 2. KARETA (Four of a Kind)
            if (groups[0].Count == 4) 
                return (800 + (int)groups[0].Rank, $"Kareta ({GetRankName((int)groups[0].Rank)})");

            // 3. FULL HOUSE (Trójka + Para)
            if (groups[0].Count == 3 && groups.Count > 1 && groups[1].Count >= 2) 
                return (700 + (int)groups[0].Rank, $"Full House ({GetRankName((int)groups[0].Rank)} na {GetRankName((int)groups[1].Rank)})");

            // 4. KOLOR (Flush)
            if (isFlush) 
                return (600 + (int)flushGroup.First().Rank, $"Kolor (na {GetRankName((int)flushGroup.First().Rank)})");

            // 5. STRIT (Straight)
            if (isStraight) 
                return (500 + straightHighRank, $"Strit (do {GetRankName(straightHighRank)})");

            // 6. TRÓJKA (Three of a Kind)
            if (groups[0].Count == 3) 
                return (400 + (int)groups[0].Rank, $"Trójka ({GetRankName((int)groups[0].Rank)})");

            // 7. DWIE PARY (Two Pairs)
            if (groups[0].Count == 2 && groups.Count > 1 && groups[1].Count >= 2) 
                return (300 + (int)groups[0].Rank, $"Dwie Pary ({GetRankName((int)groups[0].Rank)} i {GetRankName((int)groups[1].Rank)})");

            // 8. PARA (One Pair)
            if (groups[0].Count == 2) 
                return (200 + (int)groups[0].Rank, $"Para ({GetRankName((int)groups[0].Rank)})");

            // 9. WYSOKA KARTA (High Card)
            return (100 + (int)sorted[0].Rank, $"Wysoka Karta ({GetRankName((int)sorted[0].Rank)})");
        }

        // Pomocnicza metoda do ładnych nazw kart (np. 11 -> Walet)
        private string GetRankName(int rank)
        {
            return rank switch
            {
                14 => "As",
                13 => "Król",
                12 => "Dama",
                11 => "Walet",
                _ => rank.ToString()
            };
        }

private async Task SaveHandResult(string userId, decimal currentChips, decimal moneyWon)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                try 
                {
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    if (int.TryParse(userId, out int idAsInt))
                    {
                        var user = db.Users.FirstOrDefault(u => u.Id == idAsInt);
                        if (user != null)
                        {
                            // 1. Aktualizacja Balansu (Portfela)
                            user.Balance = currentChips;

                            // 2. Dodanie wpisu do Historii Gier
                            var gameHistoryEntry = new UserScore
                            {
                                UserId = idAsInt,
                                GameId = 4, // ID dla Pokera
                                Stake = 0,  // W pokerze ciężko określić "stawkę" jedną liczbą bez dodatkowej logiki, wpisujemy 0
                                MoneyWon = moneyWon,
                                Score = moneyWon > 0 ? "Wygrana" : "Przegrana",
                                DateOfGame = DateTime.UtcNow,
                            };

                            await db.UserScores.AddAsync(gameHistoryEntry);
                            
                            // Zapisujemy wszystko jednym strzałem
                            await db.SaveChangesAsync();
                            
                            Console.WriteLine($"[POKER DB] Zapisano historię dla ID {idAsInt}. Wynik: {moneyWon}");
                        }
                    }
                } 
                catch (Exception ex) 
                {
                    Console.WriteLine("Błąd zapisu historii pokera: " + ex.Message);
                }
            }
        }
        
        // Helpery do talii (GenerateDeck, ShuffleDeck, DrawCard) - bez zmian
        private List<Card> GenerateDeck() {
            var deck = new List<Card>();
            foreach (Suit s in Enum.GetValues(typeof(Suit))) foreach (Rank r in Enum.GetValues(typeof(Rank))) deck.Add(new Card(r, s));
            return deck;
        }
        private void ShuffleDeck(List<Card> deck) {
            var rng = new Random(); int n = deck.Count; while (n > 1) { n--; int k = rng.Next(n + 1); (deck[k], deck[n]) = (deck[n], deck[k]); }
        }
        private Card DrawCard(List<Card> deck) {
            if (!deck.Any()) return null; var c = deck[0]; deck.RemoveAt(0); return c;
        }
        
    }
    
}