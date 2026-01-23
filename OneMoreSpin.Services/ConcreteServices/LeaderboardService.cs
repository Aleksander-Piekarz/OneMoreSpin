using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Services.ConcreteServices;

/// <summary>
/// Serwis obsługujący rankingi i tabele liderów.
/// Pobiera top 10 graczy według wygranych kwot dla konkretnej gry.
/// Używany do wyświetlania rankingów na stronach gier.
/// </summary>
public class LeaderboardService : ILeaderboardService
{
    private readonly ApplicationDbContext _db;

    public LeaderboardService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsAsync()
    {
        return await _db
            .UserScores.Include(us => us.User)
            .OrderByDescending(us => us.MoneyWon)
            .Take(10)
            .Select(us => new ValueTuple<string, decimal>(
                us.User.Email ?? string.Empty,
                us.MoneyWon
            ))
            .ToListAsync();
    }

    public async Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsForGameAsync(
        int gameId
    )
    {
        return await _db
            .UserScores.Include(us => us.User)
            .Include(us => us.Game)
            .Where(us => us.GameId == gameId)
            .OrderByDescending(us => us.MoneyWon)
            .Take(10)
            .Select(us => new ValueTuple<string, decimal>(
                us.User.Email ?? string.Empty,
                us.MoneyWon
            ))
            .ToListAsync();
    }

    public async Task<List<(string Email, decimal MoneyWon)>> GetTop10ByWinningsForGameNameAsync(
        string gameName
    )
    {
        return await _db
            .UserScores.Include(us => us.User)
            .Include(us => us.Game)
            .Where(us => us.Game.Name == gameName)
            .OrderByDescending(us => us.MoneyWon)
            .Take(10)
            .Select(us => new ValueTuple<string, decimal>(
                us.User.Email ?? string.Empty,
                us.MoneyWon
            ))
            .ToListAsync();
    }
}
