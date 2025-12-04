using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices;

public class PokerService : BaseService, IPokerService
{
    private static readonly Random Rng = new();
    private static readonly ConcurrentDictionary<int, PokerGameSession> Sessions = new();
    private static int _nextId = 0;
    private readonly IMissionService _missionService;

    public PokerService(
        ApplicationDbContext dbContext,
        IMapper mapper,
        ILogger<PokerService> logger,
        IMissionService missionService
    )
        : base(dbContext, mapper, logger)
    {
        _missionService = missionService;
    }

    public async Task<PokerGameSessionVm> StartSessionAsync(string userId, decimal betAmount)
    {
        if (!int.TryParse(userId, out int parsedUserId))
            throw new ArgumentException("Nieprawidłowy format ID użytkownika");

        var user = DbContext.Users.Find(parsedUserId);
        if (user == null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        if (user.Balance < betAmount)
            throw new InvalidOperationException("Niewystarczające środki");

        // Zabezpieczenie proste: odejmujemy zakład teraz
        user.Balance -= betAmount;
        await DbContext.SaveChangesAsync();

        var deck = CreateShuffledDeck();

        var playerHand = new List<Card>();
        var dealerHand = new List<Card>();

        for (int i = 0; i < 5; i++)
        {
            playerHand.Add(deck[i]);
            dealerHand.Add(deck[i + 5]);
        }

        var session = new PokerGameSession
        {
            Id = Interlocked.Increment(ref _nextId),
            UserId = userId,
            PlayerHand = playerHand,
            DealerHand = dealerHand,
            BetAmount = betAmount,
            WinAmount = 0m,
            PlayerWon = false,
            CardsExchangedCount = 0,
        };

        Sessions[session.Id] = session;

        var pokerGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Poker");
        if (pokerGame != null)
        {
            await _missionService.UpdateAllGamesPlayedProgressAsync(userId, pokerGame.Id);
        }
        await DbContext.SaveChangesAsync();
        var vm = Mapper.Map<PokerGameSessionVm>(session);
        return vm;
    }

    public async Task<PokerGameSessionVm> DrawAsync(
        int sessionId,
        IEnumerable<int> cardIndicesToDiscard
    )
    {
        if (!Sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException("Nie znaleziono sesji");

        var indices =
            cardIndicesToDiscard?.Where(i => i >= 0 && i < 5).OrderBy(i => i).Take(4).ToList()
            ?? new List<int>();
        session.CardsExchangedCount = indices.Count;

        var used = new HashSet<(CardRank Rank, CardSuit Suit)>(
            session.PlayerHand.Select(c => (c.Rank, c.Suit))
        );
        used.UnionWith(session.DealerHand.Select(c => (c.Rank, c.Suit)));

        var deck = CreateShuffledDeck().Where(c => !used.Contains((c.Rank, c.Suit))).ToList();
        int deckPos = 0;

        // Replace player's discarded cards
        foreach (var idx in indices)
        {
            session.PlayerHand[idx] = deck[deckPos++];
        }

        // Evaluate hands
        session.EvaluatedPlayerHand = EvaluateHand(session.PlayerHand);
        session.EvaluatedDealerHand = EvaluateHand(session.DealerHand);

        var compare = CompareHands(session.EvaluatedPlayerHand, session.EvaluatedDealerHand);
        if (compare > 0)
        {
            session.PlayerWon = true;
            session.WinAmount = session.BetAmount * 2m;
            if (int.TryParse(session.UserId, out int uid))
            {
                var user = DbContext.Users.Find(uid);
                if (user != null)
                {
                    user.Balance += session.WinAmount;
                    await DbContext.SaveChangesAsync();
                }
            }

            await _missionService.UpdateWinTotalAmountProgressAsync(
                session.UserId,
                session.WinAmount
            );
            await _missionService.UpdateWinInARowProgressAsync(session.UserId, session.PlayerWon);
        }
        else if (compare < 0)
        {
            session.PlayerWon = false;
            session.WinAmount = 0m;
        }
        else
        {
            session.PlayerWon = false;
            session.WinAmount = session.BetAmount;
            if (int.TryParse(session.UserId, out int uid))
            {
                var user = DbContext.Users.Find(uid);
                if (user != null)
                {
                    user.Balance += session.WinAmount;
                    DbContext.SaveChanges();
                }
            }
        }
        var gameHistoryEntry = new UserScore
        {
            UserId = int.TryParse(session.UserId, out var parsedUserId) ? parsedUserId : 0,
            GameId = 4,
            Stake = session.BetAmount,
            MoneyWon = session.WinAmount,
            Score = session.WinAmount > 0 ? "Wygrana" : "Przegrana",
            DateOfGame = DateTime.UtcNow,
        };
        await DbContext.UserScores.AddAsync(gameHistoryEntry);
        await DbContext.SaveChangesAsync();

        var vm = Mapper.Map<PokerGameSessionVm>(session);
        return vm;
    }

    public async Task<PokerGameSessionVm?> GetSessionAsync(int sessionId)
    {
        if (!Sessions.TryGetValue(sessionId, out var session))
            return null;

        var vm = Mapper.Map<PokerGameSessionVm>(session);
        return vm;
    }

    private static List<Card> CreateShuffledDeck()
    {
        var deck = new List<Card>(52);
        foreach (CardSuit suit in Enum.GetValues(typeof(CardSuit)))
        {
            foreach (CardRank rank in Enum.GetValues(typeof(CardRank)))
            {
                deck.Add(new Card(rank, suit));
            }
        }

        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = Rng.Next(i + 1);
            var tmp = deck[i];
            deck[i] = deck[j];
            deck[j] = tmp;
        }

        return deck;
    }

    private static PokerHand EvaluateHand(List<Card> cards)
    {
        var hand = new PokerHand { Cards = cards.OrderByDescending(c => (int)c.Rank).ToList() };

        var ranks = hand.Cards.Select(c => (int)c.Rank).ToList();
        var suits = hand.Cards.Select(c => c.Suit).ToList();

        bool isFlush = suits.Distinct().Count() == 1;

        var distinctRanks = ranks.Distinct().OrderByDescending(r => r).ToList();

        bool isStraight = false;
        // handle wheel A-2-3-4-5
        var ordered = ranks.OrderBy(r => r).ToList();
        if (ordered.SequenceEqual(new List<int> { 2, 3, 4, 5, 14 }))
            isStraight = true;
        else if (ordered.Zip(ordered.Skip(1), (a, b) => b - a).All(d => d == 1))
            isStraight = true;

        // counts
        var groups = ranks
            .GroupBy(r => r)
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Key)
            .ToList();
        int maxCount = groups.First().Count();

        if (isStraight && isFlush && ranks.Max() == (int)CardRank.Ace)
        {
            hand.Rank = PokerHandRank.RoyalFlush;
            hand.RankDescription = "Royal Flush";
            hand.HandValue = 9000;
            return hand;
        }

        if (isStraight && isFlush)
        {
            hand.Rank = PokerHandRank.StraightFlush;
            hand.RankDescription = "Straight Flush";
            hand.HandValue = 8000 + ranks.Max();
            return hand;
        }

        if (maxCount == 4)
        {
            hand.Rank = PokerHandRank.FourOfAKind;
            hand.RankDescription = "Four of a Kind";
            hand.HandValue = 7000 + groups.First().Key;
            return hand;
        }

        if (maxCount == 3 && groups.Count > 1 && groups[1].Count() == 2)
        {
            hand.Rank = PokerHandRank.FullHouse;
            hand.RankDescription = "Full House";
            hand.HandValue = 6000 + groups.First().Key * 100 + groups[1].Key;
            return hand;
        }

        if (isFlush)
        {
            hand.Rank = PokerHandRank.Flush;
            hand.RankDescription = "Flush";
            hand.HandValue = 5000 + ranks.Max();
            return hand;
        }

        if (isStraight)
        {
            hand.Rank = PokerHandRank.Straight;
            hand.RankDescription = "Straight";
            hand.HandValue = 4000 + ranks.Max();
            return hand;
        }

        if (maxCount == 3)
        {
            hand.Rank = PokerHandRank.ThreeOfAKind;
            hand.RankDescription = "Three of a Kind";
            hand.HandValue = 3000 + groups.First().Key;
            return hand;
        }

        if (maxCount == 2 && groups.Count(g => g.Count() == 2) == 2)
        {
            hand.Rank = PokerHandRank.TwoPair;
            hand.RankDescription = "Two Pair";
            var pairKeys = groups
                .Where(g => g.Count() == 2)
                .Select(g => g.Key)
                .OrderByDescending(k => k)
                .ToList();
            hand.HandValue = 2000 + pairKeys[0] * 100 + pairKeys[1];
            return hand;
        }

        if (maxCount == 2)
        {
            hand.Rank = PokerHandRank.OnePair;
            hand.RankDescription = "One Pair";
            hand.HandValue = 1000 + groups.First().Key;
            return hand;
        }

        hand.Rank = PokerHandRank.HighCard;
        hand.RankDescription = "High Card";
        hand.HandValue = ranks.Max();
        return hand;
    }

    private static int CompareHands(PokerHand? a, PokerHand? b)
    {
        if (a == null && b == null)
            return 0;
        if (a == null)
            return -1;
        if (b == null)
            return 1;

        if (a.Rank != b.Rank)
            return a.Rank.CompareTo(b.Rank);

        if (a.HandValue != b.HandValue)
            return a.HandValue.CompareTo(b.HandValue);

        var ar = a.Cards.Select(c => (int)c.Rank).OrderByDescending(r => r).ToList();
        var br = b.Cards.Select(c => (int)c.Rank).OrderByDescending(r => r).ToList();
        for (int i = 0; i < Math.Min(ar.Count, br.Count); i++)
        {
            if (ar[i] != br[i])
                return ar[i].CompareTo(br[i]);
        }
        return 0;
    }
}
