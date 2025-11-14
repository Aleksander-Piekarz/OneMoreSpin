using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using OneMoreSpin.Services.ConcreteServices;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly SlotService _slotService;
    private readonly UserManager<User> _userManager;

    public SlotsController(SlotService slotService, UserManager<User> userManager)
    {
        _slotService = slotService;
        _userManager = userManager;
    }

    [Authorize]
    [HttpPost("spin")]
    public async Task<IActionResult> Spin([FromBody] SpinRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        if (user.Balance < req.Bet)
            return BadRequest(new { error = "Insufficient funds." });

        // odejmij stawkę
        user.Balance -= req.Bet;

        // wykonaj spin
        var result = _slotService.Spin(req.Bet);

        // dodaj wygraną
        user.Balance += result.WinAmount;

        await _userManager.UpdateAsync(user);

        return Ok(new
        {
            grid = result.Grid,
            win = result.WinAmount,
            balance = user.Balance,
            isWin = result.IsWin
        });
    }
}

public record SpinRequest(decimal Bet);
