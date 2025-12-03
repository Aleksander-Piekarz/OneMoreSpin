using System.ComponentModel.DataAnnotations;

namespace OneMoreSpin.ViewModels.VM
{
    public class ForgotPasswordVm
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}