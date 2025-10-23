namespace OneMoreSpin.Model.DataModels;

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public TransactionType TransactionType { get; set; }

    // Navigation properties
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
}
