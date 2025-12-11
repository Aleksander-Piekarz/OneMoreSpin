using System.Collections.Generic;

namespace OneMoreSpin.ViewModels.VM
{
    public class RouletteSpinRequestVm
    {
        public List<RouletteBetVm> Bets { get; set; } = new();
    }
}
