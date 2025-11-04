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

namespace OneMoreSpin.Services.ConcreteServices
{
    public class ProfileService : BaseService, IProfileService
    {
        public ProfileService(
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<ProfileService> logger
        )
            : base(dbContext, mapper, logger) { }

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
    }
}
