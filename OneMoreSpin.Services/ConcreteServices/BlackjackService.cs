using System.Collections.Concurrent;
using System.Text.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices;

public class BlackjackService : BaseService, IBlackjackService
{
    private readonly Random _rng = new();
    private readonly IMissionService _missionService;
    private static readonly ConcurrentDictionary<string, BlackjackGameSession> ActiveSessions = new();
    private static int _nextSessionId = 1;

    public BlackjackService(
        IMissionService missionService,
        ApplicationDbContext dbContext,
        IMapper mapper,
        ILogger<BlackjackService> logger
    ) : base(dbContext, mapper, logger)
    {
        _missionService = missionService;
    }

    public async Task<BlackjackGameVm> StartGameAsync(string userId, decimal bet)
    {
        if (!int.TryParse(userId, out int parsedUserId))
            throw new ArgumentException("Nieprawidłowy format ID użytkownika");

        var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
        if (user == null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        if (user.Balance < bet)
            throw new InvalidOperationException("Niewystarczające środki");

        user.Balance -= bet;

        // Create new deck and shuffle
        var deck = CreateAndShuffleDeck();

        // Deal initial cards
        var playerHand = new List<BlackjackCardVm>
        {
            DrawCard(deck),
            DrawCard(deck)
        };

        var dealerHand = new List<BlackjackCardVm>
        {
            DrawCard(deck),
            DrawCard(deck)
        };

        var playerScore = CalculateScore(playerHand);
        var sessionId = Interlocked.Increment(ref _nextSessionId);
        var sessionKey = $"{userId}_{sessionId}";

        // Create session in memory
        var session = new BlackjackGameSession
        {
            Id = sessionId,
            UserId = parsedUserId,
            Bet = bet,
            Payout = 0,
            GameState = BlackjackGameState.PlayerTurn,
            Result = BlackjackResult.None,
            CreatedAt = DateTime.UtcNow,
            PlayerHandJson = JsonSerializer.Serialize(playerHand),
            DealerHandJson = JsonSerializer.Serialize(dealerHand),
            DeckJson = JsonSerializer.Serialize(deck),
            PlayerScore = playerScore,
            DealerScore = 0
        };

        // Check for blackjack
        if (playerScore == 21)
        {
            var dealerScore = CalculateScore(dealerHand);
            session.DealerScore = dealerScore;
            session.GameState = BlackjackGameState.Finished;

            if (dealerScore == 21)
            {
                session.Result = BlackjackResult.Push;
                session.Payout = bet; // Return bet
                user.Balance += bet;
            }
            else
            {
                session.Result = BlackjackResult.Blackjack;
                session.Payout = bet * 2.5m; // 3:2 payout
                user.Balance += session.Payout;
            }
            session.FinishedAt = DateTime.UtcNow;
            await RecordGameHistory(parsedUserId, bet, session.Payout - bet);
            
            // Update missions for instant blackjack
            var blackjackGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Blackjack");
            if (blackjackGame != null)
            {
                await _missionService.UpdateAllGamesPlayedProgressAsync(userId, blackjackGame.Id);
            }
            
            var isWin = session.Result == BlackjackResult.Blackjack;
            await _missionService.UpdateWinInARowProgressAsync(userId, isWin);
            
            if (isWin)
            {
                await _missionService.UpdateWinTotalAmountProgressAsync(userId, session.Payout - bet);
            }
        }
        else
        {
            ActiveSessions[sessionKey] = session;
        }

        await DbContext.SaveChangesAsync();

        return MapToVm(session, playerHand, dealerHand, user.Balance);
    }

    public async Task<BlackjackGameVm> HitAsync(string userId, int sessionId)
    {
        if (!int.TryParse(userId, out int parsedUserId))
            throw new ArgumentException("Nieprawidłowy format ID użytkownika");

        var sessionKey = $"{userId}_{sessionId}";
        if (!ActiveSessions.TryGetValue(sessionKey, out var session))
            throw new KeyNotFoundException("Nie znaleziono sesji gry");

        if (session.GameState != BlackjackGameState.PlayerTurn)
            throw new InvalidOperationException("Nie można dobrać karty w obecnym stanie gry");

        var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
        if (user == null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        var playerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.PlayerHandJson) ?? new();
        var dealerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DealerHandJson) ?? new();
        var deck = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DeckJson) ?? new();

        // Draw card for player
        playerHand.Add(DrawCard(deck));
        var playerScore = CalculateScore(playerHand);
        session.PlayerScore = playerScore;
        session.PlayerHandJson = JsonSerializer.Serialize(playerHand);
        session.DeckJson = JsonSerializer.Serialize(deck);

        // Check if player busted
        if (playerScore > 21)
        {
            session.PlayerBusted = true;
            session.GameState = BlackjackGameState.Finished;
            session.Result = BlackjackResult.DealerWin;
            session.Payout = 0;
            session.FinishedAt = DateTime.UtcNow;
            session.DealerScore = CalculateScore(dealerHand);
            
            // Balance already decreased at start, no need to change it
            await RecordGameHistory(parsedUserId, session.Bet, -session.Bet);
            
            // Update missions
            var blackjackGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Blackjack");
            if (blackjackGame != null)
            {
                await _missionService.UpdateAllGamesPlayedProgressAsync(userId, blackjackGame.Id);
            }
            await _missionService.UpdateWinInARowProgressAsync(userId, false);
            
            await DbContext.SaveChangesAsync();
            ActiveSessions.TryRemove(sessionKey, out _);
        }

        return MapToVm(session, playerHand, dealerHand, user.Balance);
    }

    public async Task<BlackjackGameVm> StandAsync(string userId, int sessionId)
    {
        if (!int.TryParse(userId, out int parsedUserId))
            throw new ArgumentException("Nieprawidłowy format ID użytkownika");

        var sessionKey = $"{userId}_{sessionId}";
        if (!ActiveSessions.TryGetValue(sessionKey, out var session))
            throw new KeyNotFoundException("Nie znaleziono sesji gry");

        if (session.GameState != BlackjackGameState.PlayerTurn)
            throw new InvalidOperationException("Nie można spasować w obecnym stanie gry");

        var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
        if (user == null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        var playerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.PlayerHandJson) ?? new();
        var dealerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DealerHandJson) ?? new();
        var deck = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DeckJson) ?? new();

        session.GameState = BlackjackGameState.DealerTurn;

        // Dealer draws until 17 or higher
        var dealerScore = CalculateScore(dealerHand);
        while (dealerScore < 17)
        {
            dealerHand.Add(DrawCard(deck));
            dealerScore = CalculateScore(dealerHand);
        }

        session.DealerScore = dealerScore;
        session.DealerHandJson = JsonSerializer.Serialize(dealerHand);
        session.DeckJson = JsonSerializer.Serialize(deck);

        // Determine winner
        var playerScore = session.PlayerScore;
        
        if (dealerScore > 21)
        {
            session.DealerBusted = true;
            session.Result = BlackjackResult.PlayerWin;
            session.Payout = session.Bet * 2;
        }
        else if (playerScore > dealerScore)
        {
            session.Result = BlackjackResult.PlayerWin;
            session.Payout = session.Bet * 2;
        }
        else if (playerScore < dealerScore)
        {
            session.Result = BlackjackResult.DealerWin;
            session.Payout = 0;
        }
        else
        {
            session.Result = BlackjackResult.Push;
            session.Payout = session.Bet;
        }

        user.Balance += session.Payout;
        session.GameState = BlackjackGameState.Finished;
        session.FinishedAt = DateTime.UtcNow;

        await RecordGameHistory(parsedUserId, session.Bet, session.Payout - session.Bet);

        // Update missions
        var blackjackGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Blackjack");
        if (blackjackGame != null)
        {
            await _missionService.UpdateAllGamesPlayedProgressAsync(userId, blackjackGame.Id);
        }
        
        var isWin = session.Result == BlackjackResult.PlayerWin || session.Result == BlackjackResult.Blackjack;
        await _missionService.UpdateWinInARowProgressAsync(userId, isWin);
        
        if (isWin)
        {
            await _missionService.UpdateWinTotalAmountProgressAsync(userId, session.Payout - session.Bet);
        }

        await DbContext.SaveChangesAsync();
        ActiveSessions.TryRemove(sessionKey, out _);
        
        return MapToVm(session, playerHand, dealerHand, user.Balance);
    }

    public async Task<BlackjackGameVm> DoubleDownAsync(string userId, int sessionId)
    {
        if (!int.TryParse(userId, out int parsedUserId))
            throw new ArgumentException("Nieprawidłowy format ID użytkownika");

        var sessionKey = $"{userId}_{sessionId}";
        if (!ActiveSessions.TryGetValue(sessionKey, out var session))
            throw new KeyNotFoundException("Nie znaleziono sesji gry");

        if (session.GameState != BlackjackGameState.PlayerTurn)
            throw new InvalidOperationException("Nie można podwoić w obecnym stanie gry");

        var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
        if (user == null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        var playerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.PlayerHandJson) ?? new();
        
        if (playerHand.Count != 2)
            throw new InvalidOperationException("Można podwoić tylko przy pierwszym ruchu");

        if (user.Balance < session.Bet)
            throw new InvalidOperationException("Niewystarczające środki na podwojenie");

        user.Balance -= session.Bet;
        session.Bet *= 2;

        var dealerHand = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DealerHandJson) ?? new();
        var deck = JsonSerializer.Deserialize<List<BlackjackCardVm>>(session.DeckJson) ?? new();

        // Draw one card for player
        playerHand.Add(DrawCard(deck));
        var playerScore = CalculateScore(playerHand);
        session.PlayerScore = playerScore;
        session.PlayerHandJson = JsonSerializer.Serialize(playerHand);
        session.DeckJson = JsonSerializer.Serialize(deck);

        // Check if player busted
        if (playerScore > 21)
        {
            session.PlayerBusted = true;
            session.GameState = BlackjackGameState.Finished;
            session.Result = BlackjackResult.DealerWin;
            session.Payout = 0;
            session.FinishedAt = DateTime.UtcNow;
            session.DealerScore = CalculateScore(dealerHand);
            await RecordGameHistory(parsedUserId, session.Bet, -session.Bet);
            
            // Update missions for bust after double
            var blackjackGameBust = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Blackjack");
            if (blackjackGameBust != null)
            {
                await _missionService.UpdateAllGamesPlayedProgressAsync(userId, blackjackGameBust.Id);
            }
            await _missionService.UpdateWinInARowProgressAsync(userId, false);
            
            await DbContext.SaveChangesAsync();
            ActiveSessions.TryRemove(sessionKey, out _);
            return MapToVm(session, playerHand, dealerHand, user.Balance);
        }

        // Continue to dealer turn
        session.GameState = BlackjackGameState.DealerTurn;

        // Dealer draws until 17 or higher
        var dealerScore = CalculateScore(dealerHand);
        while (dealerScore < 17)
        {
            dealerHand.Add(DrawCard(deck));
            dealerScore = CalculateScore(dealerHand);
        }

        session.DealerScore = dealerScore;
        session.DealerHandJson = JsonSerializer.Serialize(dealerHand);

        // Determine winner
        if (dealerScore > 21)
        {
            session.DealerBusted = true;
            session.Result = BlackjackResult.PlayerWin;
            session.Payout = session.Bet * 2;
        }
        else if (playerScore > dealerScore)
        {
            session.Result = BlackjackResult.PlayerWin;
            session.Payout = session.Bet * 2;
        }
        else if (playerScore < dealerScore)
        {
            session.Result = BlackjackResult.DealerWin;
            session.Payout = 0;
        }
        else
        {
            session.Result = BlackjackResult.Push;
            session.Payout = session.Bet;
        }

        user.Balance += session.Payout;
        session.GameState = BlackjackGameState.Finished;
        session.FinishedAt = DateTime.UtcNow;

        await RecordGameHistory(parsedUserId, session.Bet, session.Payout - session.Bet);

        // Update missions
        var blackjackGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Blackjack");
        if (blackjackGame != null)
        {
            await _missionService.UpdateAllGamesPlayedProgressAsync(userId, blackjackGame.Id);
        }
        
        var isWin = session.Result == BlackjackResult.PlayerWin;
        await _missionService.UpdateWinInARowProgressAsync(userId, isWin);
        
        if (isWin)
        {
            await _missionService.UpdateWinTotalAmountProgressAsync(userId, session.Payout - session.Bet);
        }

        await DbContext.SaveChangesAsync();
        ActiveSessions.TryRemove(sessionKey, out _);
        
        return MapToVm(session, playerHand, dealerHand, user.Balance);
    }

    private List<BlackjackCardVm> CreateAndShuffleDeck()
    {
        var deck = new List<BlackjackCardVm>();
        var suits = new[] { "Hearts", "Diamonds", "Clubs", "Spades" };
        var ranks = new[] { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" };

        foreach (var suit in suits)
        {
            foreach (var rank in ranks)
            {
                var value = rank switch
                {
                    "A" => 11,
                    "K" => 10,
                    "Q" => 10,
                    "J" => 10,
                    _ => int.Parse(rank)
                };

                deck.Add(new BlackjackCardVm
                {
                    Rank = rank,
                    Suit = suit,
                    Value = value
                });
            }
        }

        // Shuffle using Fisher-Yates
        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = _rng.Next(i + 1);
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }

        return deck;
    }

    private BlackjackCardVm DrawCard(List<BlackjackCardVm> deck)
    {
        if (deck.Count == 0)
            throw new InvalidOperationException("Brak kart w talii");

        var card = deck[0];
        deck.RemoveAt(0);
        return card;
    }

    private int CalculateScore(List<BlackjackCardVm> hand)
    {
        int score = 0;
        int aceCount = 0;

        foreach (var card in hand)
        {
            score += card.Value;
            if (card.Rank == "A")
                aceCount++;
        }

        // Adjust for aces
        while (score > 21 && aceCount > 0)
        {
            score -= 10;
            aceCount--;
        }

        return score;
    }

    private BlackjackGameVm MapToVm(BlackjackGameSession session, List<BlackjackCardVm> playerHand, List<BlackjackCardVm> dealerHand, decimal balance)
    {
        var isFinished = session.GameState == BlackjackGameState.Finished;
        
        return new BlackjackGameVm
        {
            SessionId = session.Id,
            PlayerHand = playerHand,
            DealerHand = isFinished ? dealerHand : new List<BlackjackCardVm> { dealerHand[0] }, // Hide dealer's second card until finished
            PlayerScore = session.PlayerScore,
            DealerScore = isFinished ? session.DealerScore : 0,
            GameState = session.GameState.ToString(),
            Result = session.Result.ToString(),
            Bet = session.Bet,
            Payout = session.Payout,
            Balance = balance,
            CanHit = session.GameState == BlackjackGameState.PlayerTurn && session.PlayerScore < 21,
            CanStand = session.GameState == BlackjackGameState.PlayerTurn,
            CanDouble = session.GameState == BlackjackGameState.PlayerTurn && playerHand.Count == 2,
            GameFinished = isFinished
        };
    }

    private async Task RecordGameHistory(int userId, decimal bet, decimal winAmount)
    {
        var gameHistoryEntry = new UserScore
        {
            UserId = userId,
            GameId = 2,
            Stake = bet,
            MoneyWon = winAmount > 0 ? winAmount : 0,
            Score = winAmount > 0 ? "Wygrana" : winAmount == 0 ? "Remis" : "Przegrana",
            DateOfGame = DateTime.UtcNow,
        };
        await DbContext.UserScores.AddAsync(gameHistoryEntry);
    }
}
