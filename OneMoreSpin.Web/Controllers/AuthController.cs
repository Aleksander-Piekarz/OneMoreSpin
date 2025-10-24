using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using OneMoreSpin.Model.DataModels;
using System.Text;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IEmailSender _emailSender;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IEmailSender emailSender)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailSender = emailSender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var exists = await _userManager.FindByEmailAsync(dto.Email);
        if (exists != null)
            return BadRequest(new { error = "Email already registered" });

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name,
            Surname = dto.Surname,
            DateOfBirth = dto.DateOfBirth.ToDateTime(TimeOnly.MinValue),
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        // --- generowanie linku potwierdzającego
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var confirmUrl = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encoded}";

        var html = $@"
            <p>Hi {user.Name},</p>
            <p>Click below to confirm your e-mail:</p>
            <p><a href=""{confirmUrl}"">Confirm e-mail</a></p>";

        await _emailSender.SendEmailAsync(user.Email!, "Confirm your e-mail", html);

        return Ok(new { message = "Registration successful. Check your email to confirm your account." });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] int userId, [FromQuery] string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound("User not found");

        var decoded = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        var result = await _userManager.ConfirmEmailAsync(user, decoded);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(new { message = "Email confirmed successfully." });
    }
}

public record RegisterDto(string Email, string Password, string Name, string Surname, DateOnly DateOfBirth);
public record LoginDto(string Email, string Password);
