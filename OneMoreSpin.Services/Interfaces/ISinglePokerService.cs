using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces;

public interface ISinglePokerService
{
    Task<PokerGameSessionVm> StartSessionAsync(string userId, decimal betAmount, bool unlimitedMode = false);
    Task<PokerGameSessionVm> DrawAsync(int sessionId, IEnumerable<int> cardIndicesToDiscard, bool unlimitedMode = false);
    Task<PokerGameSessionVm?> GetSessionAsync(int sessionId);
}