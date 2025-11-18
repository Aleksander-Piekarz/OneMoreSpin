using System.ComponentModel.DataAnnotations.Schema;

namespace OneMoreSpin.Model.DataModels
{
    public class UserPlayedGame
    {
        public int UserId { get; set; }
        public virtual User User { get; set; }

        public int GameId { get; set; }
        public virtual Game Game { get; set; }
    }
}
