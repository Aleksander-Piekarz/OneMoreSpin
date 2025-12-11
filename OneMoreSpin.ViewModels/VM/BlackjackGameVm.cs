namespace OneMoreSpin.ViewModels.VM;

public class BlackjackCardVm
{
    public string Rank { get; set; } = string.Empty;
    public string Suit { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class BlackjackGameVm
{
    public int SessionId { get; set; }
    public List<BlackjackCardVm> PlayerHand { get; set; } = new();
    public List<BlackjackCardVm> DealerHand { get; set; } = new();
    public int PlayerScore { get; set; }
    public int DealerScore { get; set; }
    public string GameState { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public decimal Bet { get; set; }
    public decimal Payout { get; set; }
    public decimal Balance { get; set; }
    public bool CanHit { get; set; }
    public bool CanStand { get; set; }
    public bool CanDouble { get; set; }
    public bool GameFinished { get; set; }
}
