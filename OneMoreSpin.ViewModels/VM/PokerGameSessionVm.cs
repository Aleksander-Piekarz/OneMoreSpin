namespace OneMoreSpin.ViewModels.VM;

public class PokerGameSessionVm
{
    public int Id { get; set; }
    public List<CardVm> PlayerHand { get; set; } = new();
    public List<CardVm> DealerHand { get; set; } = new();
    public string PlayerHandRank { get; set; } = string.Empty;
    public string DealerHandRank { get; set; } = string.Empty;
    public decimal BetAmount { get; set; }
    public decimal WinAmount { get; set; }
    public bool PlayerWon { get; set; }
}
