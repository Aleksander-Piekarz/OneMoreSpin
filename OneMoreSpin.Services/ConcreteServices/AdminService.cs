using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices;

public class AdminService : BaseService, IAdminService
{
    private readonly UserManager<User> _userManager;

    public AdminService(
        ApplicationDbContext dbContext,
        IMapper mapper,
        ILogger<AdminService> logger,
        UserManager<User> userManager
    )
        : base(dbContext, mapper, logger)
    {
        _userManager = userManager;
    }

    public async Task<bool> IsUserAdminAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        var roles = await _userManager.GetRolesAsync(user);
        return roles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<AdminUsersListVm> GetAllUsersAsync(int page, int pageSize)
    {
        var totalCount = await DbContext.Users.CountAsync();

        var users = await DbContext
            .Users.OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new AdminUsersListVm
        {
            Users = Mapper.Map<List<UserProfileVm>>(users),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<UserProfileVm?> GetUserByIdAsync(int userId)
    {
        var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : Mapper.Map<UserProfileVm>(user);
    }

    public async Task<bool> DeleteUserAsync(int userId, int adminId)
    {
        if (userId == adminId)
        {
            Logger.LogWarning("Admin {AdminId} attempted to delete own account", adminId);
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        var result = await _userManager.DeleteAsync(user);
        if (result.Succeeded)
        {
            Logger.LogInformation("User {UserId} deleted by admin {AdminId}", userId, adminId);
            return true;
        }

        return false;
    }

    public async Task<bool> UpdateUserBalanceAsync(int userId, decimal balance, int adminId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        var oldBalance = user.Balance;
        user.Balance = balance;
        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            Logger.LogInformation(
                "User {UserId} balance: {OldBalance} -> {NewBalance} by admin {AdminId}",
                userId,
                oldBalance,
                balance,
                adminId
            );
            return true;
        }

        return false;
    }
}
