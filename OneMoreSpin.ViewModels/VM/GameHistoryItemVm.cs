namespace OneMoreSpin.ViewModels.VM
{
    public class GameHistoryItemVm
    {
        public string GameName { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}
