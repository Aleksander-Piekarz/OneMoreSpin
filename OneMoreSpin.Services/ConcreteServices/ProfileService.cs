using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;
using Microsoft.AspNetCore.Identity;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class ProfileService : BaseService, IProfileService
    {
        private readonly UserManager<OneMoreSpin.Model.DataModels.User> _userManager;
        public ProfileService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<ProfileService> logger,
            UserManager<OneMoreSpin.Model.DataModels.User> userManager
        )
            : base(dbContext, mapper, logger)
        {
            _userManager = userManager;
        }

        public async Task<UserProfileVm?> GetUserProfileAsync(string userId)
        {
            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);

            if (user == null)
            {
                Logger.LogWarning($"User with ID {userId} not found.");
                return null;
            }

            var userProfileVm = Mapper.Map<UserProfileVm>(user);
            return userProfileVm;
        }

        public async Task<bool> DeleteAccountAsync(string userId, string password)
        {
            try
            {
                if (!int.TryParse(userId, out var id))
                {
                    Logger.LogWarning("DeleteAccountAsync: invalid userId '{UserId}'", userId);
                    return false;
                }

                var user = await DbContext.Users
                    .Include(u => u.ChatMessages)
                    .Include(u => u.Payments)
                    .Include(u => u.UserScores)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    Logger.LogWarning("DeleteAccountAsync: user not found for id {UserId}", userId);
                    return false;
                }

                // verify password before deletion
                var passwordOk = await _userManager.CheckPasswordAsync(user, password);
                if (!passwordOk)
                {
                    Logger.LogWarning("DeleteAccountAsync: wrong password for user id {UserId}", userId);
                    return false;
                }

                DbContext.Users.Remove(user);
                await DbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "DeleteAccountAsync failed for userId {UserId}", userId);
                return false;
            }
        }
    }
}
