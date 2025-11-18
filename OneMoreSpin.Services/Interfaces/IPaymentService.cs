using OneMoreSpin.Model.DataModels; 
using OneMoreSpin.ViewModels.VM;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<List<PaymentHistoryItemVm>> GetPaymentHistoryAsync(string userId);

        Task<User> CreateDepositAsync(string userId, decimal amount);

        Task<User> CreateWithdrawalAsync(string userId, decimal amount);
    }
}