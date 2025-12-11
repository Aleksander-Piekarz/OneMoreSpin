using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers
{
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

            try
            {
                var result = await _rouletteService.SpinAsync(userId, request.Bets);
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
