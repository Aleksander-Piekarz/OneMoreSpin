using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using System.Security.Claims;

namespace OneMoreSpin.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BlackjackController : ControllerBase
{
    private readonly IBlackjackService _blackjackService;

    public BlackjackController(IBlackjackService blackjackService)
    {
        _blackjackService = blackjackService;
    }

    public class StartGameRequest
    {
        public decimal Bet { get; set; }
    }

    public class GameActionRequest
    {
        public int SessionId { get; set; }
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartGame([FromBody] StartGameRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _blackjackService.StartGameAsync(userId, request.Bet);
            return Ok(result);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { message = e.Message });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
        }
    }

    [HttpPost("hit")]
    public async Task<IActionResult> Hit([FromBody] GameActionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _blackjackService.HitAsync(userId, request.SessionId);
            return Ok(result);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { message = e.Message });
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(new { message = e.Message });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
        }
    }

    [HttpPost("stand")]
    public async Task<IActionResult> Stand([FromBody] GameActionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _blackjackService.StandAsync(userId, request.SessionId);
            return Ok(result);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { message = e.Message });
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(new { message = e.Message });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
        }
    }

    [HttpPost("double")]
    public async Task<IActionResult> DoubleDown([FromBody] GameActionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _blackjackService.DoubleDownAsync(userId, request.SessionId);
            return Ok(result);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { message = e.Message });
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(new { message = e.Message });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
        }
    }
}
