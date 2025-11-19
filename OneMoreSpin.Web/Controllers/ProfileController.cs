using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using System.Security.Claims;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly IPaymentService _paymentService;
    private readonly IGameService _gameService;
    private readonly IRewardService _rewardService;
    private readonly UserManager<User> _userManager;

    public ProfileController(
        IProfileService profileService,
        IPaymentService paymentService,
        IGameService gameService,
        IRewardService rewardService,
        UserManager<User> userManager)
    {
        _profileService = profileService;
        _paymentService = paymentService;
        _gameService = gameService;
        _rewardService = rewardService;
        _userManager = userManager;
    }

    //  GET /api/profile/me
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _profileService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    // 🔹 GET /api/profile/payments
    [HttpGet("payments")]
    public async Task<IActionResult> GetPaymentHistory()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var history = await _paymentService.GetPaymentHistoryAsync(userId);
        return Ok(history);
    }

    // 🔹 GET /api/profile/games
    [HttpGet("games")]
    public async Task<IActionResult> GetGameHistory()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var games = await _gameService.GetGameHistoryAsync(userId);
        return Ok(games);
    }

    [HttpPost("claim-daily-reward")]
    public async Task<IActionResult> ClaimDailyReward()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Użytkownik nie jest zalogowany." });
        }

        var result = await _rewardService.ClaimDailyRewardAsync(userId);

        if (!result.Success)
        {
            // Zwróć informacje o tym, kiedy będzie dostępna następna nagroda
            var response = new
            {
                message = "Nie można jeszcze odebrać nagrody.",
                dailyStreak = result.DailyStreak,
                nextClaimAvailableIn = result.NextClaimAvailableIn?.TotalSeconds
            };
            return BadRequest(response);
        }

        // Zwróć pełne informacje o odebranej nagrodzie
        return Ok(new
        {
            success = true,
            amount = result.Amount,
            dailyStreak = result.DailyStreak
        });
    }

    [HttpGet("daily-reward-status")]
    public async Task<IActionResult> GetDailyRewardStatus()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Użytkownik nie jest zalogowany." });
        }

        var status = await _rewardService.GetDailyRewardStatusAsync(userId);
        
        return Ok(new
        {
            canClaim = status.CanClaim,
            currentStreak = status.CurrentStreak,
            nextRewardStreak = status.NextRewardStreak,
            nextRewardAmount = status.NextRewardAmount,
            lastClaimedDate = status.LastClaimedDate,
            timeUntilNextClaim = status.TimeUntilNextClaim?.TotalSeconds
        });
    }
}
