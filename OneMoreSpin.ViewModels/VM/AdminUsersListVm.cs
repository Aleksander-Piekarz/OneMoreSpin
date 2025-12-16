namespace OneMoreSpin.ViewModels.VM;

public class AdminUsersListVm
{
    public List<UserProfileVm> Users { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
