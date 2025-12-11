using System.Threading.Tasks;
using OneMoreSpin.ViewModels.VM;
using System.Collections.Generic;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IRouletteService
    {
        Task<RouletteSpinResultVm> SpinAsync(string userId, List<RouletteBetVm> bets);
    }
}
