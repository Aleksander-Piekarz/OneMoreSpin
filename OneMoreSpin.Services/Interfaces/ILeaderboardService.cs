using System.Collections.Generic;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Interfaces;

public interface ILeaderboardService
{
    Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsAsync();
    Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsForGameAsync(int gameId);
    Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsForGameNameAsync(string gameName);
}
