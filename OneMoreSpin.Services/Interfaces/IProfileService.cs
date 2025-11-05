using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IProfileService
    {
        Task<UserProfileVm?> GetUserProfileAsync(string userId);
    }
}
