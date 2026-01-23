using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using System;
using System.Security.Claims;

namespace OneMoreSpin.Web.Controllers
{
    /// <summary>
    /// Kontroler API dla gry na automatach (Slots).
    /// Endpoint spin przyjmuje kwotę zakładu i zwraca siatkę symboli z wygranymi.
    /// </summary>
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
                return Ok(result);
            }
            catch (InvalidOperationException e)
            {
                return BadRequest(new { message = e.Message });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { message = $"Wystąpił błąd serwera: {e.Message}" });
            }
        }
    }
}