using System.Collections.Generic;

namespace OneMoreSpin.ViewModels.VM
{
    public class SpinResultVm
    {
        public List<List<string>> Grid { get; set; } = new List<List<string>>();
        public decimal Win { get; set; }
        public decimal Balance { get; set; } 
        public bool IsWin { get; set; }
        public List<WinDetailVm> WinDetails { get; set; } = new List<WinDetailVm>();
        
        public decimal VipBonus { get; set; }
        public bool IsVip { get; set; }
    }
}