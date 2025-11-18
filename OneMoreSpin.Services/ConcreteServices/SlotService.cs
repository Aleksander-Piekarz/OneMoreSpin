using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class SlotResult
    {
        public string[][] Grid { get; set; } = Array.Empty<string[]>();
        public decimal WinAmount { get; set; }
        public bool IsWin => WinAmount > 0;
    }

    public class SlotService : BaseService, ISlotService
    {
        private static readonly string[] Symbols = { "🍒", "🍋", "💎", "7️⃣", "🔔" };
        private readonly Random _rng = new();
        private readonly IMissionService _missionService;

        public SlotService(
            IMissionService missionService,
            ApplicationDbContext dbContext,
            IMapper mapper,
            ILogger<SlotService> logger
        )
            : base(dbContext, mapper, logger)
        {
            _missionService = missionService;
        }

        public async Task<SlotResult> Spin(decimal bet, string userId)
        {
            var result = new SlotResult { Grid = new string[3][] };

            // Wypełnij 3x3
            for (int r = 0; r < 3; r++)
            {
                result.Grid[r] = new string[3];
                for (int c = 0; c < 3; c++)
                    result.Grid[r][c] = Symbols[_rng.Next(Symbols.Length)];
            }

            // sprawdź linie poziome
            decimal win = 0;
            for (int r = 0; r < 3; r++)
            {
                if (
                    result.Grid[r][0] == result.Grid[r][1]
                    && result.Grid[r][1] == result.Grid[r][2]
                )
                    win += bet * 5;
            }

            // przekątne
            if (result.Grid[0][0] == result.Grid[1][1] && result.Grid[1][1] == result.Grid[2][2])
                win += bet * 7;
            if (result.Grid[0][2] == result.Grid[1][1] && result.Grid[1][1] == result.Grid[2][0])
                win += bet * 7;

            result.WinAmount = win;

            // Update mission progress
            await _missionService.UpdateMakeSpinsProgressAsync(userId);
            await _missionService.UpdateWinInARowProgressAsync(userId, result.IsWin);
            await _missionService.UpdateAllGamesPlayedProgressAsync(
                userId,
                DbContext.Games.FirstOrDefault(g => g.Name == "Slots")!.Id
            );
            await _missionService.UpdateWinTotalAmountProgressAsync( userId, result.WinAmount);

            return result;
        }
    }
}
