using System.Collections.Generic;
using System.Threading.Tasks;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IMissionService
    {
        Task<IEnumerable<UserMissionVm>> GetUserMissionsAsync(string userId);
        Task UpdateMakeSpinsProgressAsync(string userId);
        Task UpdateWinInARowProgressAsync(string userId, bool isWin);
        Task<bool> ClaimMissionRewardAsync(string userId, int missionId);
    }
}
