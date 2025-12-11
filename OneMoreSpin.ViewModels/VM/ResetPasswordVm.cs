using System.ComponentModel.DataAnnotations;

namespace OneMoreSpin.ViewModels.VM
{
    public class ResetPasswordVm
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "Hasła nie są identyczne.")]
        public string ConfirmNewPassword { get; set; }
    }
}