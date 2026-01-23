namespace OneMoreSpin.Model.DataModels
{
    public class UserMission
    {
        public int Id { get; set; }
        public decimal CurrentProgress { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsClaimed { get; set; }

        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int MissionId { get; set; }
        public virtual Mission Mission { get; set; } = null!;
    }
}
