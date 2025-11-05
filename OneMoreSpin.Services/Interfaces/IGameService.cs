using OneMoreSpin.ViewModels.VM;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IGameService
    {
        Task<List<GameHistoryItemVm>> GetGameHistoryAsync(string userId);
    }
}
