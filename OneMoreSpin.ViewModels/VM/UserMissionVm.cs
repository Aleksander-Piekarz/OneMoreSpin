namespace OneMoreSpin.ViewModels.VM
{
    public class UserMissionVm
    {
        public int MissionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CurrentProgress { get; set; }
        public decimal RequiredAmount { get; set; }
        public decimal RewardAmount { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsClaimed { get; set; }
    }
}
