using System;

namespace OneMoreSpin.ViewModels.VM
{
    public class ClaimRewardResultVm
    {
        public bool Success { get; set; }
        public decimal Amount { get; set; }
        public int? DailyStreak { get; set; }
        public TimeSpan? NextClaimAvailableIn { get; set; }
    }
}
