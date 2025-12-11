namespace OneMoreSpin.ViewModels.VM
{
    public class RouletteBetVm
    {
        public string Type { get; set; } // NUMBER, COLOR, PARITY, HALF
        public string Value { get; set; } // "15", "RED", "EVEN", "LOW" etc.
        public decimal Amount { get; set; }
    }
}
