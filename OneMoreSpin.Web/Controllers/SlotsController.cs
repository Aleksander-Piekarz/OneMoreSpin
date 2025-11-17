using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using OneMoreSpin.Services.Interfaces; // Zmieniono na interfejs

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService; // Zmieniono na interfejs
    private readonly UserManager<User> _userManager;

    public SlotsController(ISlotService slotService, UserManager<User> userManager) // Zmieniono na interfejs
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
        var result = await _slotService.Spin(req.Bet, userId); // Dodano await i userId

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
