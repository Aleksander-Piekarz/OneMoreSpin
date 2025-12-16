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

    
    decimal playerChips = 0;
    string dbUsername = "Nieznany";

    using (var scope = _scopeFactory.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        if (int.TryParse(userId, out int idAsInt))
        {
            var user = db.Users.FirstOrDefault(u => u.Id == idAsInt);
            if (user != null) { playerChips = user.Balance; dbUsername = user.UserName; }
            else { dbUsername = $"Guest_{idAsInt}"; }
        }
        else
        {
            var user = db.Users.FirstOrDefault(u => u.UserName == userId);
            if (user != null) { playerChips = user.Balance; dbUsername = user.UserName; }
            else { dbUsername = userId ?? "Guest"; }
        }
    }

    
    Console.WriteLine($"[JOIN] User: {dbUsername}, Pobrane żetony z bazy: {playerChips}");

    lock (table)
    {
        var existing = table.Players.FirstOrDefault(p => p.UserId == userId);

        if (existing != null)
        {
            existing.ConnectionId = connectionId;
            existing.Username = dbUsername;
            
            existing.Chips = playerChips; 
        }
        else
        {
            
            var takenSeats = table.Players.Select(p => p.SeatIndex).ToList();
            int freeSeat = -1;
            
            
            for (int i = 0; i < 6; i++) 
            {
                if (!takenSeats.Contains(i)) 
                {
                    freeSeat = i;
                    break;
                }
            }

            if (freeSeat == -1) {
                Console.WriteLine("[JOIN] Stół pełny! Nie można usiąść.");
                return;
            }

            var newPlayer = new PokerPlayer(connectionId, dbUsername, playerChips);
            newPlayer.UserId = userId;
            newPlayer.SeatIndex = freeSeat; 
            if (table.GameInProgress)
            {
                newPlayer.IsFolded = true; 
                
                _hubContext.Clients.Client(connectionId).SendAsync("ActionLog", "⏳ Gra w toku. Poczekaj na nowe rozdanie.");
            }

            table.Players.Add(newPlayer);
            Console.WriteLine($"[JOIN] Dodano {dbUsername} na miejsce {freeSeat}.");
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

        
        if (table.GameInProgress)
        {
            
            
            
            
            if (!player.IsFolded)
            {
                player.IsFolded = true;
                
                
                if (table.Players[table.CurrentPlayerIndex].ConnectionId == connectionId)
                {
                    MoveTurnToNextPlayer(table);
                }
                
                
                CheckIfRoundEnded(table);
            }
        }
        else
        {
            
            
            table.Players.Remove(player);
            Console.WriteLine($"[LEAVE] Usunięto gracza {player.Username} ze stołu (Gra nieaktywna).");
        }

        
        
        _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
        
        
        _hubContext.Clients.Group(tableId).SendAsync("PlayerLeft", player.Username);
    }
}

        public void StartNewHand(string tableId)
{
    var table = GetTable(tableId);
    if (table == null) return;

    lock (table)
    {
        Console.WriteLine($"[START] Próba startu gry na stole {tableId}. Graczy: {table.Players.Count}");

        
        foreach (var p in table.Players)
        {
            Console.WriteLine($" - Gracz {p.Username} (Seat: {p.SeatIndex}): Chips = {p.Chips}");
        }

        
        int removedCount = table.Players.RemoveAll(p => p.Chips <= 0);
        if (removedCount > 0) Console.WriteLine($"[START] Usunięto {removedCount} graczy bez żetonów.");

        if (table.Players.Count < 2)
        {
            Console.WriteLine("[START] Za mało graczy do gry (wymagane min. 2). Anulowano.");
            return;
        }

        
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
            Console.WriteLine($"   -> Rozdano karty dla {p.Username}");
        }

        
        table.DealerIndex = (table.DealerIndex + 1) % table.Players.Count;
        
        
        table.CurrentPlayerIndex = (table.DealerIndex + 1) % table.Players.Count;

        Console.WriteLine($"[START] Rozdanie rozpoczęte! Dealer: {table.DealerIndex}, Aktywny: {table.CurrentPlayerIndex}");
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
                        
                        decimal raiseTotal = player.CurrentBet + amount; 
                        if (amount > player.Chips) amount = player.Chips; 

                        if (player.Chips >= amount) {
                            player.Chips -= amount;
                            player.CurrentBet += amount;
                            table.Pot += amount;
                            
                            if (player.CurrentBet > table.CurrentMinBet) {
                                table.CurrentMinBet = player.CurrentBet;
                                table.ActionsTakenInRound = 0; 
                            }
                            moveResult = true;
                        }
                        break;
                }

                if (moveResult)
                {
                    
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
            
            if (activePlayers <= 1) {
                EndHand(table); 
                return;
            }


            int attempts = 0;
            do {
                table.CurrentPlayerIndex = (table.CurrentPlayerIndex + 1) % table.Players.Count;
                attempts++;
                var p = table.Players[table.CurrentPlayerIndex];
                
                if (!p.IsFolded && p.Chips > 0 && p.Hand.Count > 0) return;

            } while (attempts <= table.Players.Count);
            
        }

        private void CheckIfRoundEnded(PokerTable table)
        {
            var activePlayers = table.Players.Where(p => !p.IsFolded).ToList();
            var playersWithChips = activePlayers.Where(p => p.Chips > 0).ToList();

            
            if (playersWithChips.Count == 0) {
                ProceedToNextStage(table);
                return;
            }
            
            
            if (playersWithChips.Count == 1) {
                var lastMan = playersWithChips[0];
                
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
            
            
            int playersCanAct = table.Players.Count(p => !p.IsFolded && p.Chips > 0);
            if (playersCanAct <= 1 && table.Stage != "Showdown") {
                _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
                
                
                ProceedToNextStage(table); 
                return;
            }

            
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
                
                double bestScore = -1;
                foreach(var p in activePlayers) {
                    if (p.Hand.Count < 2) continue;
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
            table.CurrentPlayerIndex = -1;

            _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);

        }

        private void ResetTableState(PokerTable table)
        {
            lock (table)
            {
                table.Pot = 0;
                table.Stage = "Waiting";
                table.CommunityCards.Clear();
                table.CurrentPlayerIndex = -1;
                foreach(var p in table.Players) {
                    p.Hand.Clear();
                    p.IsFolded = false;
                    p.CurrentBet = 0;
                }
                
                
                _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
            }
        }

        
       private (double score, string name) EvaluateHandStrength(List<Card> cards)
        {
            if (cards == null || cards.Count < 5) return (0, "Błąd rozdania");

            
            var sorted = cards.OrderByDescending(c => (int)c.Rank).ToList();

            
            var groups = sorted.GroupBy(c => c.Rank)
                               .Select(g => new { Rank = g.Key, Count = g.Count() })
                               .OrderByDescending(g => g.Count) 
                               .ThenByDescending(g => g.Rank)   
                               .ToList();

            
            var flushGroup = sorted.GroupBy(c => c.Suit).FirstOrDefault(g => g.Count() >= 5);
            bool isFlush = flushGroup != null;

            
            bool isStraight = false;
            int straightHighRank = 0;

            
            var distinctRanks = sorted.Select(c => (int)c.Rank).Distinct().OrderByDescending(r => r).ToList();

            
            int consecutiveCount = 1;
            for (int i = 0; i < distinctRanks.Count - 1; i++)
            {
                if (distinctRanks[i] - 1 == distinctRanks[i + 1])
                {
                    consecutiveCount++;
                    if (consecutiveCount >= 5)
                    {
                        isStraight = true;
                        
                        
                        straightHighRank = distinctRanks[i - 3]; 
                        break; 
                    }
                }
                else
                {
                    consecutiveCount = 1; 
                }
            }

            
            
            if (!isStraight && distinctRanks.Contains(14) && distinctRanks.Contains(2) && 
                distinctRanks.Contains(3) && distinctRanks.Contains(4) && distinctRanks.Contains(5))
            {
                isStraight = true;
                straightHighRank = 5; 
            }

            

    // Wszystkie układy od najwyższego do najniższego
            if (isFlush && isStraight) return (900 + straightHighRank, $"POKER do {GetRankName(straightHighRank)}");

            
            if (groups[0].Count == 4)
            {
                
                
                double kicker = (int)sorted.First(c => c.Rank != groups[0].Rank).Rank * 0.01;
                return (800 + (int)groups[0].Rank + kicker, $"Kareta ({GetRankName((int)groups[0].Rank)})");
            }

            
            if (groups[0].Count == 3 && groups.Count > 1 && groups[1].Count >= 2)
                return (700 + (int)groups[0].Rank + ((int)groups[1].Rank * 0.01), $"Full House");

            
            if (isFlush)
            {
                
                var fCards = sorted.Where(c => c.Suit == flushGroup.Key).Take(5).ToList();
                double score = 600 + (int)fCards[0].Rank + ((int)fCards[1].Rank * 0.01) + ((int)fCards[2].Rank * 0.0001);
                return (score, $"Kolor");
            }

            
            if (isStraight) return (500 + straightHighRank, $"Strit");

            
            if (groups[0].Count == 3)
            {
                var kickers = sorted.Where(c => c.Rank != groups[0].Rank).Take(2).ToList();
                double kScore = 0;
                
                if (kickers.Count > 0) kScore += (int)kickers[0].Rank * 0.01;
                if (kickers.Count > 1) kScore += (int)kickers[1].Rank * 0.0001;

                return (400 + (int)groups[0].Rank + kScore, $"Trójka ({GetRankName((int)groups[0].Rank)})");
            }

            
            if (groups[0].Count == 2 && groups.Count > 1 && groups[1].Count >= 2)
            {
                var kicker = sorted.FirstOrDefault(c => c.Rank != groups[0].Rank && c.Rank != groups[1].Rank);
                
                double kScore = (kicker != null) ? (int)kicker.Rank * 0.01 : 0;

                return (300 + (int)groups[0].Rank + ((int)groups[1].Rank * 0.01) + (kScore * 0.0001), "Dwie Pary");
            }

            
            if (groups[0].Count == 2)
            {
                var kickers = sorted.Where(c => c.Rank != groups[0].Rank).Take(3).ToList();
                double kScore = 0;
                
                if (kickers.Count > 0) kScore += (int)kickers[0].Rank * 0.01;
                if (kickers.Count > 1) kScore += (int)kickers[1].Rank * 0.0001;
                if (kickers.Count > 2) kScore += (int)kickers[2].Rank * 0.000001;

                return (200 + (int)groups[0].Rank + kScore, $"Para ({GetRankName((int)groups[0].Rank)})");
            }

            
            
            double highCardScore = (int)sorted[0].Rank
                                 + ((int)sorted[1].Rank * 0.01)
                                 + ((int)sorted[2].Rank * 0.0001)
                                 + ((int)sorted[3].Rank * 0.000001);

            return (100 + highCardScore, $"Wysoka Karta ({GetRankName((int)sorted[0].Rank)})");
        }

        
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
                            
                            user.Balance = currentChips;

                            
                            var gameHistoryEntry = new UserScore
                            {
                                UserId = idAsInt,
                                GameId = 4, 
                                Stake = 0,  
                                MoneyWon = moneyWon,
                                Score = moneyWon > 0 ? "Wygrana" : "Przegrana",
                                DateOfGame = DateTime.UtcNow,
                            };

                            await db.UserScores.AddAsync(gameHistoryEntry);
                            
                            
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