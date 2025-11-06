using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OneMoreSpin.Web.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly IProfileService _profileService;
        private readonly IPaymentService _paymentService;
        private readonly IGameService _gameService;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public ProfileController(
            IProfileService profileService,
            IPaymentService paymentService,
            IGameService gameService,
            UserManager<User> userManager,
            SignInManager<User> signInManager)
        {
            _profileService = profileService;
            _paymentService = paymentService;
            _gameService = gameService;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var userProfile = await _profileService.GetUserProfileAsync(userId);
            if (userProfile == null)
            {
                return NotFound();
            }

            // Return only the UserProfileVm to the main Index view. Other tabs load partials.
            return View(userProfile);
        }

        // Loads payment history partial view for the Payment History tab
        public async Task<IActionResult> PaymentHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var paymentHistory = await _paymentService.GetPaymentHistoryAsync(userId);
            return PartialView("_PaymentHistory", paymentHistory);
        }

        // Loads game history partial view for the Game History tab
        public async Task<IActionResult> GameHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var gameHistory = await _gameService.GetGameHistoryAsync(userId);
            return PartialView("_GameHistory", gameHistory);
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAccount([FromForm] string password)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return BadRequest("Password is required to delete the account.");
            }

            var result = await _profileService.DeleteAccountAsync(userId, password);
            if (result)
            {
                await _signInManager.SignOutAsync();
                return RedirectToAction("Index", "Home");
            }
            else
            {
                return BadRequest("Account deletion failed. Check your password and try again.");
            }
        }
    }
}
