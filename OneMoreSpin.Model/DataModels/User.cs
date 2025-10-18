using Microsoft.AspNetCore.Identity;

namespace OneMoreSpin.Model.DataModels;

public class User : IdentityUser<int>
{
    public string Name { get; set; } = null!;
    public string Surname { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public decimal Balance { get; set; }
    public bool IsVip { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = [];
    public virtual ICollection<Payment> Payments { get; set; } = [];
    public virtual ICollection<UserScore> UserScores { get; set; } = [];

    public int? LobbyId { get; set; }
    public virtual Lobby? Lobby { get; set; } = null!;

    public User() { }
}
