using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces; // Użyj ISlotService
using System;
using System.Security.Claims;
using OneMoreSpin.Services.Interfaces; // Zmieniono na interfejs

namespace OneMoreSpin.Web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SlotsController : ControllerBase
    {
        private readonly ISlotService _slotService;
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

            var unlimited = false;
            if (Request.Headers.TryGetValue("X-Unlimited-Mode", out var vals))
            {
                unlimited = vals.FirstOrDefault() == "true";
            }

            try
            {
                var result = await _slotService.SpinAsync(userId, request.Bet, unlimited);
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