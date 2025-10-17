using Microsoft.AspNetCore.Identity;

namespace OneMoreSpin.Model.DataModels
{
    public class User : IdentityUser<int>
    {
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public decimal Balance { get; set; }
        public bool IsBool { get; set; }
        public bool IsActive { get; set; }
    }
}
