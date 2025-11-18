using OneMoreSpin.ViewModels.VM;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IRewardService
    {
        Task<ClaimRewardResultVm> ClaimDailyRewardAsync(string userId);
    }
}
