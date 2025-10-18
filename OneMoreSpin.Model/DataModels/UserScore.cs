namespace OneMoreSpin.Model.DataModels;

public class UserScore
{
    public int Id { get; set; }
    public int Score { get; set; }

    //Navigation properties
    public int GameId { get; set; }
    public virtual Game Game { get; set; } = null!;
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public UserScore() { }
}
