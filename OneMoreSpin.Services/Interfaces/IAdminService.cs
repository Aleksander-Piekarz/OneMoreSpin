using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces;

public interface IAdminService
{
    Task<bool> IsUserAdminAsync(int userId);
    Task<AdminUsersListVm> GetAllUsersAsync(int page, int pageSize);
    Task<UserProfileVm?> GetUserByIdAsync(int userId);
    Task<bool> DeleteUserAsync(int userId, int adminId);
    Task<bool> UpdateUserBalanceAsync(int userId, decimal balance, int adminId);
}
