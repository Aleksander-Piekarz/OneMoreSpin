using OneMoreSpin.ViewModels.VM;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<List<PaymentHistoryItemVm>> GetPaymentHistoryAsync(string userId);
    }
}
