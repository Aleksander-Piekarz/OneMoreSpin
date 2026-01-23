using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Web.Controllers;

/// <summary>
/// Kontroler API dla rankingów i tabel liderów.
/// Endpointy: top 10 dla konkretnej gry.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _service;

    public LeaderboardController(ILeaderboardService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var top = await _service.GetTop10ByWinningsAsync();
        var result = top.Select(t => new { Email = t.Email, MoneyWon = t.MoneyWon });
        return Ok(result);
    }

    [HttpGet("game/{gameId:int}")]
    public async Task<IActionResult> GetByGameId([FromRoute] int gameId)
    {
        var top = await _service.GetTop10ByWinningsForGameAsync(gameId);
        var result = top.Select(t => new { Email = t.Email, MoneyWon = t.MoneyWon });
        return Ok(result);
    }

    [HttpGet("game/name/{gameName}")]
    public async Task<IActionResult> GetByGameName([FromRoute] string gameName)
    {
        var top = await _service.GetTop10ByWinningsForGameNameAsync(gameName);
        var result = top.Select(t => new { Email = t.Email, MoneyWon = t.MoneyWon });
        return Ok(result);
    }
}
