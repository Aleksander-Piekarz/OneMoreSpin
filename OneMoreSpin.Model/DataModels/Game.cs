namespace OneMoreSpin.Model.DataModels;

public class Game
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;

    public virtual ICollection<Lobby> Lobbies { get; set; } = [];
    public virtual ICollection<UserScore> UserScores { get; set; } = [];

    public Game() { }
}
