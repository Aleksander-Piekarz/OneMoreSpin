namespace OneMoreSpin.Model.DataModels;

public class UserScore
{
    public int Id { get; set; }
    public DateTime DateOfGame { get; set; } = DateTime.Now;
    public decimal Stake { get; set; }
    public string Score { get; set; }
    public decimal MoneyWon { get; set; }

    //Navigation properties
    public int GameId { get; set; }
    public virtual Game Game { get; set; } = null!;
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    public UserScore() { }
}
