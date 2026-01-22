using System.Collections.Generic;

namespace OneMoreSpin.Model.DataModels
{
    public class Mission
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; } // Angielski opis misji
        public MissionType MissionType { get; set; }
        public decimal RequiredAmount { get; set; } // Cel do osiągnięcia (np. 5 gier, 1000 zł)
        public decimal RewardAmount { get; set; }   // Nagroda pieniężna

        // Właściwość nawigacyjna
        public virtual ICollection<UserMission> UserMissions { get; set; } = new List<UserMission>();
    }
}
