using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;

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
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"); // fallback
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(sub);
        if (user == null)
            return NotFound();

        return Ok(
            new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                surname = user.Surname,
                balance = userBalance(user),
                isVip = user.IsVip,
                emailConfirmed = user.EmailConfirmed,
            }
        );

        static decimal userBalance(User u) => u.Balance;
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(sub);
        if (user == null)
            return NotFound();

        var result = await _userManager.ChangePasswordAsync(
            user,
            dto.CurrentPassword,
            dto.NewPassword
        );

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [Authorize]
    [HttpDelete("delete-account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(sub);
        if (user == null)
            return NotFound();

        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
        {
            return BadRequest(new { error = "Invalid password" });
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return Ok(new { message = "Account deleted successfully" });
    }

    [HttpPost("dev/set-balance")]
    public async Task<IActionResult> SetBalance(
        [FromBody] decimal amount,
        [FromServices] IWebHostEnvironment env
    )
    {
        if (!env.IsDevelopment())
            return Forbid();
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(id!);
        user!.Balance = amount;
        await _userManager.UpdateAsync(user);
        return Ok(new { balance = user.Balance });
    }

    [HttpPost("dev/set-vip")]
    public async Task<IActionResult> SetVip(
        [FromBody] bool isVip,
        [FromServices] IWebHostEnvironment env
    )
    {
        if (!env.IsDevelopment())
            return Forbid();
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(id!);
        user!.IsVip = isVip;
        await _userManager.UpdateAsync(user);
        return Ok(new { isVip = user.IsVip });
    }
}

public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record DeleteAccountDto(string Password);
