using System;

namespace OneMoreSpin.ViewModels.VM
{
    public class DailyRewardStatusVm
    {
        public bool CanClaim { get; set; }
        public int CurrentStreak { get; set; }
        public int NextRewardStreak { get; set; }
        public decimal NextRewardAmount { get; set; }
        public DateTime? LastClaimedDate { get; set; }
        public TimeSpan? TimeUntilNextClaim { get; set; }
    }
}
