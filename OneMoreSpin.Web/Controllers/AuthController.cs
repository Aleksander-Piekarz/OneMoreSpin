using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IEmailSender _emailSender;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IEmailSender emailSender
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailSender = emailSender;
    }

    private string GenerateJwt(User user, IConfiguration cfg)
    {
        var key = cfg["Jwt:Key"]!;
        var issuer = cfg["Jwt:Issuer"]!;
        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), 
        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
        new Claim("name", user.Name ?? ""),
        new Claim("surname", user.Surname ?? "")
    };

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
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
            DateOfBirth = dto.DateOfBirth,
            IsActive = true,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        //
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var confirmUrl =
            $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encoded}";

        var html =
            $@"
            <p>Hi {user.Name},</p>
            <p>Click below to confirm your e-mail:</p>
            <p><a href=""{confirmUrl}"">Confirm e-mail</a></p>";

        await _emailSender.SendEmailAsync(user.Email!, "Confirm your e-mail", html);

        return Ok(
            new { message = "Registration successful. Check your email to confirm your account." }
        );
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] int userId, [FromQuery] string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return NotFound("User not found");

        var decoded = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        var result = await _userManager.ConfirmEmailAsync(user, decoded);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(new { message = "Email confirmed successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto,
        [FromServices] IConfiguration cfg
    )
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized(new { error = "Invalid credentials" });
        if (!user.EmailConfirmed)
            return Unauthorized(new { error = "Please confirm your e-mail before logging in." });

        var ok = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!ok.Succeeded)
            return Unauthorized(new { error = "Invalid credentials" });

        // Ustawienie IsActive = true i LastSeenAt przy logowaniu
        if (!user.IsActive)
        {
            user.IsActive = true;
        }
        user.LastSeenAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var token = GenerateJwt(user, cfg);

        return Ok(
            new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.Surname,
                    user.IsVip,
                    user.Balance,
                },
            }
        );
    }


// 1. Endpoint: Żądanie resetu hasła
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordVm model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null) 
            {

                return Ok(new { message = "Jeśli konto istnieje, link do resetowania hasła został wysłany." });
            }

            // Generowanie tokenu
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);


            var frontendUrl = "http://localhost:5173"; // Adres frontendu aplikacji
            // Token w URLu wymaga zakodowania, bo zawiera znaki + / =
            var encodedToken = System.Net.WebUtility.UrlEncode(token);
            var resetLink = $"{frontendUrl}/reset-password?token={encodedToken}&email={model.Email}";

            // Wysyłka maila
            await _emailSender.SendEmailAsync(
                model.Email, 
                "Resetowanie hasła w OneMoreSpin", 
                $"Kliknij tutaj, aby zresetować hasło: <a href='{resetLink}'>link</a>"
            );

            return Ok(new { message = "Jeśli konto istnieje, link do resetowania hasła został wysłany." });
        }

        // 2. Endpoint: Ustawienie nowego hasła
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordVm model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {

                return BadRequest(new { message = "Nieprawidłowe żądanie." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new { message = "Hasło zostało pomyślnie zmienione." });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(ModelState);
        }

        [HttpPost("logout")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { error = "Invalid user" });

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return NotFound(new { error = "User not found" });

            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { error = "Failed to update user status" });

            return Ok(new { message = "Logout successful" });
        }
    }


public record RegisterDto(
    string Email,
    string Password,
    string Name,
    string Surname,
    DateOnly DateOfBirth
);

public record LoginDto(string Email, string Password);
