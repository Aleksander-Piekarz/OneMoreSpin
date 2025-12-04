using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PokerController : ControllerBase
{
    private readonly IPokerService _pokerService;

    public PokerController(IPokerService pokerService)
    {
        _pokerService = pokerService;
    }

    public class StartRequest
    {
        public decimal BetAmount { get; set; }
    }

    public class DrawRequest
    {
        public List<int> DiscardIndices { get; set; } = new();
    }

    [HttpPost("start")]
    [Authorize]
    public async Task<IActionResult> Start([FromBody] StartRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var vm = await _pokerService.StartSessionAsync(userId, req.BetAmount);
        return Ok(vm);
    }

    [HttpPost("{id:int}/draw")]
    [Authorize]
    public async Task<IActionResult> Draw(int id, [FromBody] DrawRequest req)
    {
        var vm = await _pokerService.DrawAsync(id, req.DiscardIndices);
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
