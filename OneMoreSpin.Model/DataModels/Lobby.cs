namespace OneMoreSpin.Model.DataModels;

public class Lobby
{
    public int Id { get; set; }
    public LobbyStatus Status { get; set; } = LobbyStatus.Waiting;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int MaxPlayers { get; set; }

    // Navigation properties
    public int GameId { get; set; }
    public virtual Game Game { get; set; } = null!;
    public virtual ICollection<User> Users { get; set; } = [];

    public Lobby() { }
}
