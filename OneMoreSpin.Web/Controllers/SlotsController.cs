using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces; // Użyj ISlotService
using System;
using System.Security.Claims;
using OneMoreSpin.Services.Interfaces; // Zmieniono na interfejs

namespace OneMoreSpin.Web.Controllers
{
    private readonly ISlotService _slotService; // Zmieniono na interfejs
    private readonly UserManager<User> _userManager;

    public SlotsController(ISlotService slotService, UserManager<User> userManager) // Zmieniono na interfejs
    {
        _slotService = slotService;
        _userManager = userManager;
    }

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SlotsController : ControllerBase
    {
        private readonly ISlotService _slotService;

//         if (user.Balance < req.Bet)
//             return BadRequest(new { error = "Insufficient funds." });

//         // odejmij stawkę
//         user.Balance -= req.Bet;

//         // wykonaj spin
//         var result = await _slotService.Spin(req.Bet, userId); // Dodano await i userId

//         // dodaj wygraną
//         user.Balance += result.WinAmount;
        // Prosimy o interfejs, a nie o klasę
        
        public SlotsController(ISlotService slotService)
        {
            _slotService = slotService;
        }

        // Klasa DTO (Data Transfer Object) dla żądania
        public class SpinRequest
        {
            public decimal Bet { get; set; }
        }

        [HttpPost("spin")]
        public async Task<IActionResult> Spin([FromBody] SpinRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            try
            {
                var result = await _slotService.SpinAsync(userId, request.Bet);
                return Ok(result); // Zwróć obiekt SpinResultVm
            }
            catch (InvalidOperationException e)
            {
                // Np. "Niewystarczające środki"
                return BadRequest(new { message = e.Message });
            }
            catch (Exception e)
            {
                // Inne błędy
                return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
            }
        }
    }
}