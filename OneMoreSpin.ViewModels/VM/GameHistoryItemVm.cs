namespace OneMoreSpin.ViewModels.VM
{
    public class GameHistoryItemVm
    {
        public string GameName { get; set; } = string.Empty;
       // public string Outcome { get; set; }
        public DateTime DateOfGame { get; set; }
        public decimal Stake { get; set; }
        public decimal MoneyWon { get; set; }


    }
}
