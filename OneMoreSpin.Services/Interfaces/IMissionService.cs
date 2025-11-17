using System.Collections.Generic;
using System.Threading.Tasks;
using OneMoreSpin.Model.DataModels;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IMissionService
    {
      
        Task<(bool Success, string Message)> ClaimMissionRewardAsync(string userId, int missionId);
        Task<IEnumerable<UserMission>> GetOrUpdateMissionProgressAsync(
            string userId,
            MissionType? missionType = null,
            decimal? valueToAdd = null
        );
    }
}
