using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IRewardService
    {
        Task<(bool Success, string Message, decimal Amount)> ClaimDailyRewardAsync(string userId);
    }
}
