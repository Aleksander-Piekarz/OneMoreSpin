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
    public class MultiplayerBlackjackService : IMultiplayerBlackjackService
    {
        private readonly ConcurrentDictionary<string, BlackjackTable> _tables = new();
        private readonly ConcurrentDictionary<string, string> _playerTables = new();
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<BlackjackHub> _hubContext;

        public MultiplayerBlackjackService(IServiceScopeFactory scopeFactory, IHubContext<BlackjackHub> hubContext)
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;
            
            // Tworzenie stołów przy starcie
            CreateTable("blackjack-1", "Stół Początkujący", 10);
            CreateTable("blackjack-2", "Stół Zaawansowany", 50);
            CreateTable("blackjack-vip", "VIP ROOM", 200);
        }

        private void CreateTable(string id, string name, decimal minBet)
        {
            _tables.TryAdd(id, new BlackjackTable { Id = id, MinBet = minBet });
        }

        public List<BlackjackTableInfoDto> GetLobbyInfo()
        {
            return _tables.Values.Select(t => new BlackjackTableInfoDto
            {
                Id = t.Id,
                Name = t.Id == "blackjack-vip" ? "VIP Room" : (t.Id == "blackjack-2" ? "High Stakes" : "Beginners"),
                PlayersCount = t.Players.Count,
                MinBet = t.MinBet
            }).ToList();
        }

        public BlackjackTable? GetTable(string tableId)
        {
            if (string.IsNullOrEmpty(tableId)) return null;
            _tables.TryGetValue(tableId, out var table);
            return table;
        }

        public void JoinTable(string tableId, string connectionId, string userId)
        {
            var table = GetTable(tableId);
            if (table == null) return;

            decimal playerChips = 0;
            string dbUsername = "Nieznany";
            bool isVip = false;

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                if (int.TryParse(userId, out int idAsInt))
                {
                    var user = db.Users.FirstOrDefault(u => u.Id == idAsInt);
                    if (user != null) { playerChips = user.Balance; dbUsername = user.UserName ?? "Nieznany"; isVip = user.IsVip; }
                    else { dbUsername = $"Guest_{idAsInt}"; }
                }
                else
                {
                    var user = db.Users.FirstOrDefault(u => u.UserName == userId);
                    if (user != null) { playerChips = user.Balance; dbUsername = user.UserName ?? "Nieznany"; isVip = user.IsVip; }
                    else { dbUsername = userId ?? "Guest"; }
                }
            }

            Console.WriteLine($"[BLACKJACK JOIN] User: {dbUsername}, Żetony: {playerChips}, VIP: {isVip}");

            lock (table)
            {
                var existing = table.Players.FirstOrDefault(p => p.UserId == userId);

                if (existing != null)
                {
                    existing.ConnectionId = connectionId;
                    existing.Username = dbUsername;
                    existing.Chips = playerChips;
                    existing.IsVip = isVip;
                    
                    // Resetuj wyniki z poprzedniej gry gdy gracz wraca
                    if (!table.GameInProgress)
                    {
                        existing.Result = "";
                        existing.Payout = 0;
                        existing.CurrentBet = 0;
                        existing.Hand.Clear();
                        existing.Score = 0;
                        existing.HasStood = false;
                        existing.HasBusted = false;
                        existing.HasBlackjack = false;
                        existing.HasDoubledDown = false;
                    }
                }
                else
                {
                    var takenSeats = table.Players.Select(p => p.SeatIndex).ToList();
                    int freeSeat = -1;
                    
                    for (int i = 0; i < 5; i++) // Max 5 graczy + dealer
                    {
                        if (!takenSeats.Contains(i))
                        {
                            freeSeat = i;
                            break;
                        }
                    }

                    if (freeSeat == -1)
                    {
                        Console.WriteLine("[BLACKJACK JOIN] Stół pełny!");
                        return;
                    }

                    var newPlayer = new BlackjackPlayer(connectionId, dbUsername, playerChips);
                    newPlayer.UserId = userId ?? "";
                    newPlayer.SeatIndex = freeSeat;
                    newPlayer.IsVip = isVip;

                    table.Players.Add(newPlayer);
                    Console.WriteLine($"[BLACKJACK JOIN] Dodano {dbUsername} na miejsce {freeSeat}. VIP: {isVip}");
                }

                _playerTables.TryAdd(connectionId, tableId);
            }
        }

        public void LeaveTable(string connectionId)
        {
            if (!_playerTables.TryRemove(connectionId, out string? tableId) || tableId == null) return;

            var table = GetTable(tableId);
            if (table == null) return;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
                if (player == null) return;

                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"🚪 {player.Username} opuścił stół.");

                if (table.GameInProgress)
                {
                    // Jeśli gra w toku, oznacz gracza jako spasowanego
                    player.HasStood = true;
                    player.HasBusted = true;
                    
                    // Sprawdź czy trzeba przejść do następnego gracza
                    if (table.Players[table.CurrentPlayerIndex]?.ConnectionId == connectionId)
                    {
                        MoveTurnToNextPlayer(table);
                    }
                }
                else
                {
                    table.Players.Remove(player);
                    Console.WriteLine($"[BLACKJACK LEAVE] Usunięto gracza {player.Username}.");
                }

                _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                _hubContext.Clients.Group(tableId).SendAsync("PlayerLeft", player.Username);
            }
        }

        public bool PlaceBet(string tableId, string userId, decimal amount)
        {
            var table = GetTable(tableId);
            if (table == null) return false;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null) return false;

                if (amount < table.MinBet)
                {
                    _hubContext.Clients.Client(player.ConnectionId).SendAsync("Error", $"Minimalna stawka to ${table.MinBet}");
                    return false;
                }

                if (amount > player.Chips)
                {
                    _hubContext.Clients.Client(player.ConnectionId).SendAsync("Error", "Niewystarczające środki");
                    return false;
                }

                player.CurrentBet = amount;
                player.Chips -= amount;
                table.PlayersReady++;

                Console.WriteLine($"[BLACKJACK BET] {player.Username} postawił ${amount}. Ready: {table.PlayersReady}/{table.Players.Count}");

                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"💰 {player.Username} postawił ${amount}");
                
                // Sprawdź czy wszyscy postawili - jeśli tak, rozpocznij od razu
                if (table.PlayersReady >= table.Players.Count && table.Players.Count >= 1)
                {
                    table.WaitingForBets = false;
                    table.BettingCountdown = 0;
                    _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                    StartRoundInternal(table, tableId);
                }
                else if (!table.WaitingForBets && table.PlayersReady == 1)
                {
                    // Pierwszy gracz postawił - uruchom timer 30 sekund
                    StartBettingCountdown(tableId, table);
                }
                else
                {
                    _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                }

                return true;
            }
        }

        private void StartBettingCountdown(string tableId, BlackjackTable table)
        {
            table.WaitingForBets = true;
            table.BettingCountdown = 30;

            _hubContext.Clients.Group(tableId).SendAsync("ActionLog", "⏱️ 30 sekund na obstawianie!");
            _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);

            Task.Run(async () =>
            {
                for (int i = 30; i > 0; i--)
                {
                    await Task.Delay(1000);
                    
                    lock (table)
                    {
                        if (!table.WaitingForBets || table.GameInProgress) return; // Przerwano lub gra się zaczęła
                        
                        table.BettingCountdown = i - 1;
                        
                        if (i == 10 || i == 5)
                        {
                            _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"⏱️ Pozostało {i - 1} sekund!");
                        }
                        
                        _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                    }
                }

                lock (table)
                {
                    if (!table.WaitingForBets || table.GameInProgress) return;
                    
                    table.WaitingForBets = false;
                    table.BettingCountdown = 0;
                    
                    // Usuń graczy, którzy nie postawili
                    var playersWithoutBet = table.Players.Where(p => p.CurrentBet <= 0).ToList();
                    foreach (var p in playersWithoutBet)
                    {
                        _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"❌ {p.Username} nie postawił - pomija rundę");
                    }
                    
                    // Jeśli ktoś postawił, rozpocznij grę
                    if (table.Players.Any(p => p.CurrentBet > 0))
                    {
                        StartRoundInternal(table, tableId);
                    }
                    else
                    {
                        _hubContext.Clients.Group(tableId).SendAsync("ActionLog", "❌ Nikt nie postawił - gra anulowana");
                        _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                    }
                }
            });
        }

        public void StartRound(string tableId)
        {
            var table = GetTable(tableId);
            if (table == null) return;

            lock (table)
            {
                // Zatrzymaj timer jeśli działa
                table.WaitingForBets = false;
                table.BettingCountdown = 0;
                
                StartRoundInternal(table, tableId);
            }
        }

        private void StartRoundInternal(BlackjackTable table, string tableId)
        {
            Console.WriteLine($"[BLACKJACK START] Próba startu gry na stole {tableId}. Graczy: {table.Players.Count}");

            // Usuwamy graczy bez żetonów
            table.Players.RemoveAll(p => p.Chips <= 0 && p.CurrentBet <= 0);

            // Filtrujemy graczy, którzy postawili zakład
            var activePlayers = table.Players.Where(p => p.CurrentBet > 0).ToList();
            
            if (activePlayers.Count < 1)
            {
                Console.WriteLine("[BLACKJACK START] Brak graczy ze stawką.");
                _hubContext.Clients.Group(tableId).SendAsync("Error", "Przynajmniej jeden gracz musi postawić zakład!");
                return;
            }

            // Resetuj stan gry
            table.Deck = GenerateDeck();
            ShuffleDeck(table.Deck);
            table.DealerHand.Clear();
            table.DealerScore = 0;
            table.DealerBusted = false;
            table.DealerHasBlackjack = false;
            table.Stage = "Dealing";
            table.GameInProgress = true;
            table.PlayersReady = 0;

            // Resetuj graczy
            foreach (var p in table.Players)
            {
                p.Hand.Clear();
                p.Score = 0;
                p.HasStood = false;
                p.HasBusted = false;
                p.HasBlackjack = false;
                p.HasDoubledDown = false;
                p.Result = "";
                p.Payout = 0;
            }

            // Rozdaj karty graczom (2 karty każdemu)
            foreach (var p in activePlayers)
            {
                p.Hand.Add(DrawCard(table.Deck));
                p.Hand.Add(DrawCard(table.Deck));
                p.Score = CalculateScore(p.Hand);
                
                // Sprawdź blackjacka
                if (p.Score == 21)
                {
                    p.HasBlackjack = true;
                }
            }

            // Rozdaj karty dealerowi (2 karty)
            table.DealerHand.Add(DrawCard(table.Deck));
            table.DealerHand.Add(DrawCard(table.Deck));
            table.DealerScore = CalculateScore(table.DealerHand);

            // Sprawdź blackjacka dealera
            if (table.DealerScore == 21)
            {
                table.DealerHasBlackjack = true;
            }

            // Rozpocznij turę pierwszego aktywnego gracza
            table.Stage = "PlayerTurns";
            var firstActivePlayer = activePlayers.FirstOrDefault(p => !p.HasBlackjack);
            if (firstActivePlayer != null)
            {
                table.CurrentPlayerIndex = table.Players.IndexOf(firstActivePlayer);
            }
            else
            {
                // Wszyscy mają blackjacka - przejdź do rozstrzygnięcia
                table.Stage = "DealerTurn";
                ProcessDealerTurn(table);
                return;
            }

            Console.WriteLine($"[BLACKJACK START] Rozdanie rozpoczęte! Aktywny gracz: {table.CurrentPlayerIndex}");
            
            _hubContext.Clients.Group(tableId).SendAsync("ActionLog", "🃏 Karty rozdane!");
            _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
        }

        public bool PlayerHit(string tableId, string userId)
        {
            var table = GetTable(tableId);
            if (table == null) return false;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null) return false;
                
                if (table.Stage != "PlayerTurns") return false;
                if (table.Players[table.CurrentPlayerIndex].UserId != userId) return false;
                if (player.HasStood || player.HasBusted) return false;

                // Dobierz kartę
                player.Hand.Add(DrawCard(table.Deck));
                player.Score = CalculateScore(player.Hand);

                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"🎴 {player.Username} dobiera kartę ({player.Score})");

                if (player.Score > 21)
                {
                    player.HasBusted = true;
                    _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"💥 {player.Username} BUST!");
                    MoveTurnToNextPlayer(table);
                }
                else if (player.Score == 21)
                {
                    player.HasStood = true;
                    _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"🎯 {player.Username} ma 21!");
                    MoveTurnToNextPlayer(table);
                }

                _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                return true;
            }
        }

        public bool PlayerStand(string tableId, string userId)
        {
            var table = GetTable(tableId);
            if (table == null) return false;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null) return false;
                
                if (table.Stage != "PlayerTurns") return false;
                if (table.Players[table.CurrentPlayerIndex].UserId != userId) return false;
                if (player.HasStood || player.HasBusted) return false;

                player.HasStood = true;
                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"✋ {player.Username} stoi ({player.Score})");

                MoveTurnToNextPlayer(table);
                _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                return true;
            }
        }

        public bool PlayerDouble(string tableId, string userId)
        {
            var table = GetTable(tableId);
            if (table == null) return false;

            lock (table)
            {
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null) return false;
                
                if (table.Stage != "PlayerTurns") return false;
                if (table.Players[table.CurrentPlayerIndex].UserId != userId) return false;
                if (player.HasStood || player.HasBusted || player.HasDoubledDown) return false;
                if (player.Hand.Count != 2) return false; // Można podwoić tylko przy pierwszym ruchu
                if (player.Chips < player.CurrentBet) return false; // Sprawdź czy ma wystarczająco na podwojenie

                // Podwój zakład
                player.Chips -= player.CurrentBet;
                player.CurrentBet *= 2;
                player.HasDoubledDown = true;

                // Dobierz jedną kartę
                player.Hand.Add(DrawCard(table.Deck));
                player.Score = CalculateScore(player.Hand);

                _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"✖️2 {player.Username} podwaja! ({player.Score})");

                if (player.Score > 21)
                {
                    player.HasBusted = true;
                    _hubContext.Clients.Group(tableId).SendAsync("ActionLog", $"💥 {player.Username} BUST!");
                }

                player.HasStood = true; // Po podwojeniu gracz automatycznie stoi
                MoveTurnToNextPlayer(table);
                _hubContext.Clients.Group(tableId).SendAsync("UpdateGameState", table);
                return true;
            }
        }

        private void MoveTurnToNextPlayer(BlackjackTable table)
        {
            var activePlayers = table.Players.Where(p => p.CurrentBet > 0).ToList();
            
            // Znajdź następnego gracza, który może grać
            int currentIdx = table.CurrentPlayerIndex;
            int attempts = 0;

            do
            {
                currentIdx = (currentIdx + 1) % table.Players.Count;
                attempts++;

                var p = table.Players[currentIdx];
                if (p.CurrentBet > 0 && !p.HasStood && !p.HasBusted && !p.HasBlackjack)
                {
                    table.CurrentPlayerIndex = currentIdx;
                    return;
                }
            } while (attempts < table.Players.Count);

            // Wszyscy gracze zakończyli - tura dealera
            table.Stage = "DealerTurn";
            ProcessDealerTurn(table);
        }

        private void ProcessDealerTurn(BlackjackTable table)
        {
            _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", "🎰 Tura krupiera...");

            var activePlayers = table.Players.Where(p => p.CurrentBet > 0 && !p.HasBusted).ToList();

            // Jeśli wszyscy gracze zbustowali, krupier nie musi grać
            if (activePlayers.All(p => p.HasBusted))
            {
                EndRound(table);
                return;
            }

            // Krupier dobiera karty do 17
            while (table.DealerScore < 17)
            {
                table.DealerHand.Add(DrawCard(table.Deck));
                table.DealerScore = CalculateScore(table.DealerHand);
            }

            if (table.DealerScore > 21)
            {
                table.DealerBusted = true;
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"💥 Krupier BUST! ({table.DealerScore})");
            }
            else
            {
                _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🎰 Krupier stoi z {table.DealerScore}");
            }

            _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
            EndRound(table);
        }

        private void EndRound(BlackjackTable table)
        {
            table.Stage = "Showdown";
            
            _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", "=========================");
            
            foreach (var player in table.Players.Where(p => p.CurrentBet > 0))
            {
                if (player.HasBusted)
                {
                    player.Result = "Lose";
                    player.Payout = 0;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"❌ {player.Username}: Przegrana (Bust)");
                }
                else if (player.HasBlackjack && !table.DealerHasBlackjack)
                {
                    player.Result = "Blackjack";
                    player.Payout = player.CurrentBet * 2.5m;
                    player.Chips += player.Payout;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🏆 {player.Username}: BLACKJACK! +${player.Payout}");
                }
                else if (player.HasBlackjack && table.DealerHasBlackjack)
                {
                    player.Result = "Push";
                    player.Payout = player.CurrentBet;
                    player.Chips += player.Payout;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🤝 {player.Username}: Remis (oba Blackjack) +${player.Payout}");
                }
                else if (table.DealerHasBlackjack)
                {
                    player.Result = "Lose";
                    player.Payout = 0;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"❌ {player.Username}: Przegrana (Dealer Blackjack)");
                }
                else if (table.DealerBusted)
                {
                    player.Result = "Win";
                    player.Payout = player.CurrentBet * 2;
                    player.Chips += player.Payout;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🏆 {player.Username}: Wygrana! +${player.Payout}");
                }
                else if (player.Score > table.DealerScore)
                {
                    player.Result = "Win";
                    player.Payout = player.CurrentBet * 2;
                    player.Chips += player.Payout;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🏆 {player.Username}: Wygrana! ({player.Score} vs {table.DealerScore}) +${player.Payout}");
                }
                else if (player.Score < table.DealerScore)
                {
                    player.Result = "Lose";
                    player.Payout = 0;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"❌ {player.Username}: Przegrana ({player.Score} vs {table.DealerScore})");
                }
                else
                {
                    player.Result = "Push";
                    player.Payout = player.CurrentBet;
                    player.Chips += player.Payout;
                    _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", $"🤝 {player.Username}: Remis ({player.Score} = {table.DealerScore}) +${player.Payout}");
                }

                // Zapisz wynik do bazy - WAŻNE: zapisz wartości PRZED Task.Run, bo CurrentBet będzie zresetowany
                decimal savedBet = player.CurrentBet;
                decimal savedPayout = player.Payout;
                decimal savedMoneyWon = savedPayout - savedBet;
                string savedUserId = player.UserId;
                decimal savedChips = player.Chips;
                
                Console.WriteLine($"[DEBUG] Przed zapisem: UserId={savedUserId}, Bet={savedBet}, Payout={savedPayout}, MoneyWon={savedMoneyWon}");
                
                _ = Task.Run(async () => await SaveRoundResult(savedUserId, savedChips, savedBet, savedMoneyWon));
            }

            _hubContext.Clients.Group(table.Id).SendAsync("ActionLog", "=========================");

            // Reset stanu na następną rundę
            table.GameInProgress = false;
            table.CurrentPlayerIndex = -1;

            // Reset zakładów graczy
            foreach (var p in table.Players)
            {
                p.CurrentBet = 0;
            }

            _hubContext.Clients.Group(table.Id).SendAsync("UpdateGameState", table);
        }

        private async Task SaveRoundResult(string userId, decimal currentChips, decimal bet, decimal moneyWon)
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
                                GameId = 2, // Blackjack
                                Stake = bet,
                                MoneyWon = moneyWon > 0 ? moneyWon : 0,
                                Score = moneyWon > 0 ? "Wygrana" : (moneyWon == 0 ? "Remis" : "Przegrana"),
                                DateOfGame = DateTime.UtcNow,
                            };

                            await db.UserScores.AddAsync(gameHistoryEntry);
                            await db.SaveChangesAsync();

                            Console.WriteLine($"[BLACKJACK DB] Zapisano historię dla ID {idAsInt}. Bet: {bet}, Wynik: {moneyWon}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Błąd zapisu historii blackjacka: " + ex.Message);
                }
            }
        }

        private int CalculateScore(List<Card> hand)
        {
            int score = 0;
            int aceCount = 0;

            foreach (var card in hand)
            {
                int value = (int)card.Rank;
                if (value >= 11 && value <= 13) // J, Q, K
                {
                    score += 10;
                }
                else if (value == 14) // Ace
                {
                    score += 11;
                    aceCount++;
                }
                else
                {
                    score += value;
                }
            }

            // Dostosuj asy
            while (score > 21 && aceCount > 0)
            {
                score -= 10;
                aceCount--;
            }

            return score;
        }

        private List<Card> GenerateDeck()
        {
            var deck = new List<Card>();
            // 6 talii
            for (int d = 0; d < 6; d++)
            {
                foreach (Suit s in Enum.GetValues(typeof(Suit)))
                {
                    foreach (Rank r in Enum.GetValues(typeof(Rank)))
                    {
                        deck.Add(new Card(r, s));
                    }
                }
            }
            return deck;
        }

        private void ShuffleDeck(List<Card> deck)
        {
            var rng = new Random();
            int n = deck.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                (deck[k], deck[n]) = (deck[n], deck[k]);
            }
        }

        private Card DrawCard(List<Card> deck)
        {
            if (!deck.Any()) throw new InvalidOperationException("Brak kart w talii");
            var c = deck[0];
            deck.RemoveAt(0);
            return c;
        }
    }
}
