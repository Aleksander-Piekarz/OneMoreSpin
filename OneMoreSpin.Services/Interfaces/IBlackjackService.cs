using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces;

public interface IBlackjackService
{
    Task<BlackjackGameVm> StartGameAsync(string userId, decimal bet, bool unlimitedMode = false);
    Task<BlackjackGameVm> HitAsync(string userId, int sessionId, bool unlimitedMode = false);
    Task<BlackjackGameVm> StandAsync(string userId, int sessionId, bool unlimitedMode = false);
    Task<BlackjackGameVm> DoubleDownAsync(string userId, int sessionId, bool unlimitedMode = false);
}
