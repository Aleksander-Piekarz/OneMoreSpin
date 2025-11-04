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
        private readonly UserManager<User> _userManager;

        public ProfileController(IProfileService profileService, IPaymentService paymentService, UserManager<User> userManager)
        {
            _profileService = profileService;
            _paymentService = paymentService;
            _userManager = userManager;
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
    }
}
