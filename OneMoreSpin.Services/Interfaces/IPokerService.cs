using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.Interfaces;

public interface IPokerService
{
    Task<PokerGameSessionVm> StartSessionAsync(string userId, decimal betAmount);
    Task<PokerGameSessionVm> DrawAsync(int sessionId, IEnumerable<int> cardIndicesToDiscard);
    Task<PokerGameSessionVm?> GetSessionAsync(int sessionId);
}
