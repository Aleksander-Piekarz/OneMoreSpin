using System.Collections.Generic;

namespace OneMoreSpin.Model.DataModels
{
    public class Mission
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public MissionType MissionType { get; set; }
        public decimal RequiredAmount { get; set; }
        public decimal RewardAmount { get; set; }

        public virtual ICollection<UserMission> UserMissions { get; set; } = new List<UserMission>();
    }
}
