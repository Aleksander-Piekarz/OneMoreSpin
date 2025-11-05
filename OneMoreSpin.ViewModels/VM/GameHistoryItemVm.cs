namespace OneMoreSpin.ViewModels.VM
{
    public class GameHistoryItemVm
    {
        public string GameName { get; set; } = string.Empty;
        public int Score { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}
