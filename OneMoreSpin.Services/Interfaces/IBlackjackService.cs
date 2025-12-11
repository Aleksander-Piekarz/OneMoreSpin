using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces;

public interface IBlackjackService
{
    Task<BlackjackGameVm> StartGameAsync(string userId, decimal bet);
    Task<BlackjackGameVm> HitAsync(string userId, int sessionId);
    Task<BlackjackGameVm> StandAsync(string userId, int sessionId);
    Task<BlackjackGameVm> DoubleDownAsync(string userId, int sessionId);
}
