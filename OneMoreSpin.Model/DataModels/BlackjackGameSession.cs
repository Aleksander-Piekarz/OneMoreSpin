namespace OneMoreSpin.Model.DataModels;

public enum BlackjackGameState
{
    Betting,
    PlayerTurn,
    DealerTurn,
    Finished
}

public enum BlackjackResult
{
    None,
    PlayerWin,
    DealerWin,
    Push,
    Blackjack
}

public class BlackjackGameSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Bet { get; set; }
    public decimal Payout { get; set; }
    public BlackjackGameState GameState { get; set; }
    public BlackjackResult Result { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    
    // Serialized as JSON
    public string PlayerHandJson { get; set; } = "[]";
    public string DealerHandJson { get; set; } = "[]";
    public string DeckJson { get; set; } = "[]";
    
    public int PlayerScore { get; set; }
    public int DealerScore { get; set; }
    public bool PlayerBusted { get; set; }
    public bool DealerBusted { get; set; }
    
    // Navigation
    public virtual User User { get; set; } = null!;
}
