using System;
using System.Collections.Generic;
using System.Linq;
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
    /// <summary>
    /// Serwis obsługujący grę na automatach (Slots).
    /// Generuje siatkę 3x5 symboli z ważonym losowaniem (weighted random).
    /// Sprawdza 10 linii wygrywających i oblicza wypłaty według tabeli mnożników.
    /// Symbole: LEMON, CHERRIES, GRAPES, BELL, CLOVER, DIAMOND, SEVEN (rosnące wartości).
    /// </summary>
    public class SlotService : BaseService, ISlotService
    {
        private const int Rows = 3;
        private const int Cols = 5;

        private readonly Random _rng = new();
        private readonly IMissionService _missionService;

        private static readonly Dictionary<string, Dictionary<int, decimal>> PayoutTable = new()
        {
            {
                "LEMON",
                new Dictionary<int, decimal>
                {
                    { 3, 0.5m },
                    { 4, 2.0m },
                    { 5, 5.0m },
                }
            },
            {
                "CHERRIES",
                new Dictionary<int, decimal>
                {
                    { 3, 1.0m },
                    { 4, 3.0m },
                    { 5, 10.0m },
                }
            },
            {
                "GRAPES",
                new Dictionary<int, decimal>
                {
                    { 3, 2.0m },
                    { 4, 6.0m },
                    { 5, 20.0m },
                }
            },
            {
                "BELL",
                new Dictionary<int, decimal>
                {
                    { 3, 3.0m },
                    { 4, 10.0m },
                    { 5, 40.0m },
                }
            },
            {
                "CLOVER",
                new Dictionary<int, decimal>
                {
                    { 3, 5.0m },
                    { 4, 15.0m },
                    { 5, 60.0m },
                }
            },
            {
                "DIAMOND",
                new Dictionary<int, decimal>
                {
                    { 3, 10.0m },
                    { 4, 30.0m },
                    { 5, 150.0m },
                }
            },
            {
                "SEVEN",
                new Dictionary<int, decimal>
                {
                    { 3, 20.0m },
                    { 4, 100.0m },
                    { 5, 500.0m },
                }
            },
        };

        private static readonly Dictionary<string, int> SymbolWeights = new()
        {
            { "LEMON", 40 },
            { "CHERRIES", 30 },
            { "GRAPES", 25 },
            { "BELL", 20 },
            { "CLOVER", 15 },
            { "DIAMOND", 10 },
            { "SEVEN", 8 },
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

        public async Task<SpinResultVm> SpinAsync(string userId, decimal bet, bool unlimitedMode = false)
        {
            if (!int.TryParse(userId, out int parsedUserId))
                throw new ArgumentException("Nieprawidłowy format ID użytkownika");

            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
            if (user == null)
                throw new KeyNotFoundException("Nie znaleziono użytkownika");

            if (!unlimitedMode)
            {
                if (user.Balance < bet)
                    throw new InvalidOperationException("Niewystarczające środki");

                user.Balance -= bet;
            }

            int totalWeight = SymbolWeights.Values.Sum();

            var grid = new List<List<string>>();

            for (int r = 0; r < Rows; r++)
            {
                var rowList = new List<string>();
                for (int c = 0; c < Cols; c++)
                {
                    string randomSymbol = GetRandomWeightedSymbol(totalWeight);
                    rowList.Add(randomSymbol);
                }
                grid.Add(rowList);
            }

            var (totalWin, winDetails) = CalculateWins(grid, bet);

            decimal vipBonus = 0;
            if (totalWin > 0 && user.IsVip)
            {
                vipBonus = totalWin * 0.15m;
                totalWin += vipBonus;
            }

            if (totalWin > 0 && !unlimitedMode)
            {
                user.Balance += totalWin;
            }

            var gameHistoryEntry = new UserScore
            {
                UserId = parsedUserId,
                GameId = 3,
                Stake = bet,
                MoneyWon = totalWin,
                Score = totalWin > 0 ? "Wygrana" : "Przegrana",
                DateOfGame = DateTime.UtcNow,
            };
            await DbContext.UserScores.AddAsync(gameHistoryEntry);

            var isWin = totalWin > 0;
            var slotGame = await DbContext.Games.FirstOrDefaultAsync(g => g.Name == "Slots");
            if (slotGame != null)
            {
                await _missionService.UpdateAllGamesPlayedProgressAsync(userId, slotGame.Id);
            }
            await _missionService.UpdateMakeSpinsProgressAsync(userId);
            await _missionService.UpdateWinInARowProgressAsync(userId, isWin);
            await _missionService.UpdateWinTotalAmountProgressAsync(userId, totalWin);

            await DbContext.SaveChangesAsync();

            return new SpinResultVm
            {
                Grid = grid,
                Win = totalWin,
                IsWin = totalWin > 0,
                Balance = user.Balance,
                WinDetails = winDetails,
                VipBonus = vipBonus,
                IsVip = user.IsVip,
            };
        }

        private string GetRandomWeightedSymbol(int totalWeight)
        {
            int randomNumber = _rng.Next(0, totalWeight);
            int currentWeightSum = 0;

            foreach (var kvp in SymbolWeights)
            {
                currentWeightSum += kvp.Value;
                if (randomNumber < currentWeightSum)
                {
                    return kvp.Key;
                }
            }

            return SymbolWeights.Keys.Last();
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
                                new WinDetailVm
                                {
                                    PaylineIndex = paylineIndex,
                                    Count = count,
                                    Multiplier = multiplier,
                                }
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
