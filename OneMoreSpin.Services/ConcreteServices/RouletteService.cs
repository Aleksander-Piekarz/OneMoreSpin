using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using Microsoft.Extensions.Logging;

namespace OneMoreSpin.Services.ConcreteServices
{
    public class RouletteService : IRouletteService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMissionService _missionService;
        private readonly ILogger<RouletteService> _logger;
        private readonly Random _rng = new();

        private static readonly HashSet<int> RedNumbers = new()
        {
            1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
        };

        public RouletteService(ApplicationDbContext dbContext, IMissionService missionService, ILogger<RouletteService> logger)
        {
            _dbContext = dbContext;
            _missionService = missionService;
            _logger = logger;
        }

        public async Task<RouletteSpinResultVm> SpinAsync(string userId, List<RouletteBetVm> bets, bool unlimitedMode = false)
        {
            if (!int.TryParse(userId, out var parsedUserId))
            {
                throw new ArgumentException("Nieprawidłowe ID użytkownika");
            }
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
            if (user == null)
            {
                throw new KeyNotFoundException("Użytkownik nie znaleziony");
            }

            if (bets == null || !bets.Any())
            {
                throw new ArgumentException("Brak zakładów");
            }

            decimal totalStake = bets.Sum(b => b.Amount);
            if (totalStake <= 0) throw new ArgumentException("Stawka musi być > 0");
            if (!unlimitedMode && user.Balance < totalStake) throw new InvalidOperationException("Niewystarczające środki");

            if (!unlimitedMode)
            {
                user.Balance -= totalStake;
            }

            int winNumber = _rng.Next(0, 37);
            string winColor = winNumber == 0 ? "GREEN" : (RedNumbers.Contains(winNumber) ? "RED" : "BLACK");

            decimal totalWinAmount = 0;
            bool anyWin = false;

            foreach (var bet in bets)
            {
                bool isWin = false;
                decimal multiplier = 0;

                switch (bet.Type)
                {
                    case "NUMBER":
                        if (int.TryParse(bet.Value, out int betNum))
                        {
                            if (betNum == winNumber)
                            {
                                isWin = true;
                                multiplier = 36;
                            }
                        }
                        break;
                    case "COLOR":
                        if (winNumber != 0)
                        {
                            if (bet.Value == "RED" && winColor == "RED") { isWin = true; multiplier = 2; }
                            if (bet.Value == "BLACK" && winColor == "BLACK") { isWin = true; multiplier = 2; }
                        }
                        break;
                    case "PARITY":
                        if (winNumber != 0)
                        {
                            if (bet.Value == "EVEN" && winNumber % 2 == 0) { isWin = true; multiplier = 2; }
                            if (bet.Value == "ODD" && winNumber % 2 != 0) { isWin = true; multiplier = 2; }
                        }
                        break;
                    case "HALF":
                        if (winNumber != 0)
                        {
                            if (bet.Value == "LOW" && winNumber <= 18) { isWin = true; multiplier = 2; }
                            if (bet.Value == "HIGH" && winNumber >= 19) { isWin = true; multiplier = 2; }
                        }
                        break;
                }

                if (isWin)
                {
                    totalWinAmount += bet.Amount * multiplier;
                    anyWin = true;
                }
            }

            if (!unlimitedMode)
            {
                user.Balance += totalWinAmount;
            }

            const string rouletteName = "Ruletka";
            var rouletteGame = await _dbContext.Games.FirstOrDefaultAsync(g => g.Name == rouletteName);
            if (rouletteGame == null)
            {
                rouletteGame = new Game
                {
                    Name = rouletteName,
                    Description = "Klasyczna ruletka europejska",
                    ImageUrl = "roulette.png"
                };
                await _dbContext.Games.AddAsync(rouletteGame);
                await _dbContext.SaveChangesAsync();
            }

            var userScore = new UserScore
            {
                UserId = parsedUserId,
                GameId = rouletteGame.Id,
                Stake = totalStake,
                MoneyWon = totalWinAmount,
                Score = anyWin ? "Wygrana" : "Przegrana",
                DateOfGame = DateTime.UtcNow
            };
            await _dbContext.UserScores.AddAsync(userScore);

            await _missionService.UpdateAllGamesPlayedProgressAsync(userId, rouletteGame.Id);
            await _missionService.UpdateMakeSpinsProgressAsync(userId);
            await _missionService.UpdateWinInARowProgressAsync(userId, anyWin);
            await _missionService.UpdateWinTotalAmountProgressAsync(userId, totalWinAmount);

            await _dbContext.SaveChangesAsync();

            return new RouletteSpinResultVm
            {
                WinNumber = winNumber,
                WinColor = winColor,
                IsWin = anyWin,
                WinAmount = totalWinAmount,
                Message = anyWin ? $"Wygrałeś {totalWinAmount}!" : "Przegrana",
                Balance = user.Balance
            };
        }
    }
}
