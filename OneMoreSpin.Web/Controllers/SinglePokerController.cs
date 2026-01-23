using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers;

/// <summary>
/// Kontroler API dla Pokera jednoosobowego (Video Poker).
/// Endpointy: start sesji, wymiana kart (draw), pobierz stan sesji.
/// Gracz dostaje 5 kart, może wymienić do 4, następnie porównanie z krupierem.
/// </summary>
[ApiController]
[Route("api/singlepoker")]
public class SinglePokerController : ControllerBase
{
    private readonly ISinglePokerService _pokerService;

    public SinglePokerController(ISinglePokerService pokerService)
    {
        _pokerService = pokerService;
    }

    public class StartRequest
    {
        public decimal BetAmount { get; set; }
    }

    public class DrawRequest
    {
        public int SessionId { get; set; }
        public List<int> Indices { get; set; } = new();
        public List<int> DiscardIndices { get; set; } = new();
    }

    [HttpPost("start")]
    [Authorize]
    public async Task<IActionResult> Start([FromBody] StartRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var unlimited = false;
        if (Request.Headers.TryGetValue("X-Unlimited-Mode", out var vals))
        {
            unlimited = vals.FirstOrDefault() == "true";
        }

        var vm = await _pokerService.StartSessionAsync(userId, req.BetAmount, unlimited);
        return Ok(vm);
    }

    [HttpPost("draw")]
    [HttpPost("{id:int}/draw")]
    [Authorize]
    public async Task<IActionResult> Draw(int id, [FromBody] DrawRequest req)
    {
        int sessionId = id > 0 ? id : req.SessionId;
        var indices = req.Indices.Any() ? req.Indices : req.DiscardIndices;
        var unlimited = false;
        if (Request.Headers.TryGetValue("X-Unlimited-Mode", out var vals))
        {
            unlimited = vals.FirstOrDefault() == "true";
        }

        var vm = await _pokerService.DrawAsync(sessionId, indices, unlimited);
        return Ok(vm);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Get(int id)
    {
        var vm = await _pokerService.GetSessionAsync(id);
        if (vm is null) return NotFound();
        return Ok(vm);
    }
}