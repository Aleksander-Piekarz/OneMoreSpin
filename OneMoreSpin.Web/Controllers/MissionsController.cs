using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OneMoreSpin.Web.Controllers
{
    /// <summary>
    /// Kontroler API dla systemu misji.
    /// Endpointy: pobierz misje użytkownika, odbierz nagrodę za ukończoną misję.
    /// Misje resetują się co tydzień (w poniedziałek).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MissionsController : ControllerBase
    {
        private readonly IMissionService _missionService;

        public MissionsController(IMissionService missionService)
        {
            _missionService = missionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserMissions()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var missions = await _missionService.GetUserMissionsAsync(userId);
            return Ok(missions);
        }

        [HttpPost("{missionId}/claim")]
        public async Task<IActionResult> ClaimReward(int missionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var success = await _missionService.ClaimMissionRewardAsync(userId, missionId);

            if (!success)
            {
                return BadRequest(new { message = "Nie udało się odebrać nagrody." });
            }

            return Ok(new { message = "Nagroda została odebrana!" });
        }
    }
}
