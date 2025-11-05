using System;

namespace OneMoreSpin.ViewModels.VM
{
    public class PaymentHistoryItemVm
    {
        public DateTime CreatedAt { get; set; }
        public decimal Amount { get; set; }

        public string TransactionType { get; set; }
    }
}
