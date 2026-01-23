using System.Threading.Tasks;
using OneMoreSpin.Services.ConcreteServices;
using OneMoreSpin.ViewModels.VM;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface ISlotService
    {
        Task<SpinResultVm> SpinAsync(string userId, decimal bet, bool unlimitedMode = false);
    }
}
