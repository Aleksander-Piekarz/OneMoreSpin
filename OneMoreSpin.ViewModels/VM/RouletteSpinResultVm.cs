namespace OneMoreSpin.ViewModels.VM
{
    public class RouletteSpinResultVm
    {
        public int WinNumber { get; set; }
        public bool IsWin { get; set; }
        public decimal WinAmount { get; set; }
        public string Message { get; set; } = string.Empty;
        public string BetType { get; set; } = string.Empty;
        public int? ChosenNumber { get; set; }
        public string WinColor { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
}
