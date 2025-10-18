namespace OneMoreSpin.Model.DataModels;

public class ChatMessage
{
    public int Id { get; set; }
    public string Message { get; set; } = null!;

    // Navigation properties
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public ChatMessage() { }
}
