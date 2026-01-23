namespace OneMoreSpin.Model.DataModels;

public class PokerGameSession
{
    public int Id { get; set; }

    public List<Card> PlayerHand { get; set; } = [];
    public List<Card> DealerHand { get; set; } = [];

    public PokerHand? EvaluatedPlayerHand { get; set; }
    public PokerHand? EvaluatedDealerHand { get; set; }

    public decimal BetAmount { get; set; }
    public decimal WinAmount { get; set; }
    public bool PlayerWon { get; set; }
    public int CardsExchangedCount { get; set; }

    public PokerGameSession() { }

    public string UserId { get; set; } = null!;
    public User? User { get; set; }
}
