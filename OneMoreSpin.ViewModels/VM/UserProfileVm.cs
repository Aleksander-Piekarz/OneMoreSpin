namespace OneMoreSpin.ViewModels.VM;

public class UserProfileVm
{
    public int Id { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public decimal Balance { get; set; }
    public bool IsVip { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastSeenAt { get; set; }
}
