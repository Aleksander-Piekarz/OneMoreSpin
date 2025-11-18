using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class SlotService : BaseService, ISlotService
    {
        private const int Rows = 3;
        private const int Cols = 5;

        private static readonly string[] Symbols = { "J", "Q", "K", "A", "🔔", "💎", "7️⃣" };
        private readonly Random _rng = new();
        private readonly IMissionService _missionService;

        private static readonly Dictionary<string, Dictionary<int, decimal>> PayoutTable = new()
        {
            {
                "J",
                new Dictionary<int, decimal>
                {
                    { 3, 0.3m },
                    { 4, 0.6m },
                    { 5, 1.2m },
                }
            },
            {
                "Q",
                new Dictionary<int, decimal>
                {
                    { 3, 0.4m },
                    { 4, 0.8m },
                    { 5, 1.6m },
                }
            },
            {
                "K",
                new Dictionary<int, decimal>
                {
                    { 3, 0.5m },
                    { 4, 1.0m },
                    { 5, 2.0m },
                }
            },
            {
                "A",
                new Dictionary<int, decimal>
                {
                    { 3, 0.6m },
                    { 4, 1.2m },
                    { 5, 2.4m },
                }
            },
            {
                "🔔",
                new Dictionary<int, decimal>
                {
                    { 3, 1.0m },
                    { 4, 2.0m },
                    { 5, 4.0m },
                }
            },
            {
                "💎",
                new Dictionary<int, decimal>
                {
                    { 3, 2.5m },
                    { 4, 10.0m },
                    { 5, 25.0m },
                }
            },
            {
                "7️⃣",
                new Dictionary<int, decimal>
                {
                    { 3, 5.0m },
                    { 4, 25.0m },
                    { 5, 100.0m },
                }
            },
        };

        private static readonly List<List<(int row, int col)>> Paylines = new()
        {
            new() { (1, 0), (1, 1), (1, 2), (1, 3), (1, 4) },
            new() { (0, 0), (0, 1), (0, 2), (0, 3), (0, 4) },
            new() { (2, 0), (2, 1), (2, 2), (2, 3), (2, 4) },
            new() { (0, 0), (1, 1), (2, 2), (1, 3), (0, 4) },
            new() { (2, 0), (1, 1), (0, 2), (1, 3), (2, 4) },
            new() { (1, 0), (0, 1), (0, 2), (0, 3), (1, 4) },
            new() { (1, 0), (2, 1), (2, 2), (2, 3), (1, 4) },
            new() { (0, 0), (0, 1), (1, 2), (2, 3), (2, 4) },
            new() { (2, 0), (2, 1), (1, 2), (0, 3), (0, 4) },
            new() { (0, 0), (1, 1), (1, 2), (1, 3), (2, 4) },
        };

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

        public async Task<SpinResultVm> SpinAsync(string userId, decimal bet)
        {
            if (!int.TryParse(userId, out int parsedUserId))
            {
                throw new ArgumentException("Nieprawidłowy format ID użytkownika");
            }

            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
            if (user == null)
            {
                throw new KeyNotFoundException("Nie znaleziono użytkownika");
            }

            if (user.Balance < bet)
            {
                throw new InvalidOperationException("Niewystarczające środki");
            }
            user.Balance -= bet;

            var grid = new List<List<string>>();
            for (int r = 0; r < Rows; r++)
            {
                var row = new List<string>();
                for (int c = 0; c < Cols; c++)
                {
                    row.Add(Symbols[_rng.Next(Symbols.Length)]);
                }
                grid.Add(row);
            }

            var (totalWin, winDetails) = CalculateWins(grid, bet);

            if (totalWin > 0)
            {
                user.Balance += totalWin;
            }

            var gameHistoryEntry = new UserScore
            {
                UserId = parsedUserId,
                GameId = 3, // TODO: Hardcoded ID, consider making it dynamic
                Stake = bet,
                MoneyWon = totalWin,
                Score = totalWin > 0 ? "Wygrana" : "Przegrana",
                DateOfGame = DateTime.UtcNow,
            };
            await DbContext.UserScores.AddAsync(gameHistoryEntry);
            var isWin = true ? totalWin > 0 : false;
            // --- INTEGRACJA Z MISJAMI ---
            var slotGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Slots");
            await _missionService.UpdateAllGamesPlayedProgressAsync(userId, slotGame.Id);
            await _missionService.UpdateMakeSpinsProgressAsync(userId);
            await _missionService.UpdateWinInARowProgressAsync(userId, isWin);
            await _missionService.UpdateWinTotalAmountProgressAsync(userId, totalWin);
            // --- KONIEC INTEGRACJI ---

            await DbContext.SaveChangesAsync();

            return new SpinResultVm
            {
                Grid = grid,
                Win = totalWin,
                IsWin = totalWin > 0,
                Balance = user.Balance,
                WinDetails = winDetails,
            };
        }

        private (decimal totalWin, List<WinDetailVm> winDetails) CalculateWins(
            List<List<string>> grid,
            decimal bet
        )
        {
            decimal totalWin = 0;
            var winDetails = new List<WinDetailVm>();
            int paylineIndex = 0;

            foreach (var payline in Paylines)
            {
                string firstSymbol = grid[payline[0].row][payline[0].col];
                int count = 1;
                for (int i = 1; i < payline.Count; i++)
                {
                    if (grid[payline[i].row][payline[i].col] == firstSymbol)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }

                if (count >= 3)
                {
                    if (PayoutTable.TryGetValue(firstSymbol, out var symbolPayouts))
                    {
                        if (symbolPayouts.TryGetValue(count, out var multiplier))
                        {
                            totalWin += bet * multiplier;
                            winDetails.Add(
                                new WinDetailVm { PaylineIndex = paylineIndex, Count = count }
                            );
                        }
                    }
                }
                paylineIndex++;
            }

            return (totalWin, winDetails);
        }
    }
}
