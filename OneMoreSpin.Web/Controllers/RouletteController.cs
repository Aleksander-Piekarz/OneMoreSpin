using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers
{
    /// <summary>
    /// Kontroler API dla gry Ruletka.
    /// Endpoint spin przyjmuje listę zakładów i zwraca wylosowany numer oraz wygrane.
    /// Obsługuje różne typy zakładów: numery, kolory, parzyste/nieparzyste, dziesiątki.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RouletteController : ControllerBase
    {
        private readonly IRouletteService _rouletteService;
        public RouletteController(IRouletteService rouletteService)
        {
            _rouletteService = rouletteService;
        }

        [HttpPost("spin")]
        public async Task<IActionResult> Spin([FromBody] RouletteSpinRequestVm request)
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
                var result = await _rouletteService.SpinAsync(userId, request.Bets, unlimited);
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
