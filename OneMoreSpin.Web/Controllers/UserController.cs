using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    public UsersController(UserManager<User> userManager) => _userManager = userManager;

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub"); // fallback
        if (string.IsNullOrWhiteSpace(sub)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(sub);
        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            surname = user.Surname,
            balance = userBalance(user),
            isVip = user.IsVip,
            emailConfirmed = user.EmailConfirmed
        });

        static decimal userBalance(User u) => u.Balance;
    }

    [HttpPost("dev/set-balance")]
    public async Task<IActionResult> SetBalance([FromBody] decimal amount, [FromServices] IWebHostEnvironment env)
    {
        if (!env.IsDevelopment()) return Forbid();
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(id!);
        user!.Balance = amount;
        await _userManager.UpdateAsync(user);
        return Ok(new { balance = user.Balance });
    }
}
