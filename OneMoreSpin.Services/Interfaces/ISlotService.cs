using System.Threading.Tasks;
using OneMoreSpin.Services.ConcreteServices;

namespace OneMoreSpin.Services.Interfaces
{
    public interface ISlotService
    {
        Task<SlotResult> Spin(decimal bet, string userId);
    }
}
