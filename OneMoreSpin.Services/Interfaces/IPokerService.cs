using OneMoreSpin.Model.DataModels;
using System.Collections.Generic;

namespace OneMoreSpin.Services.Interfaces
{
    // Prosta klasa DTO do przesyłania info o stołach
    public class TableInfoDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int PlayersCount { get; set; }
        public decimal MinBuyIn { get; set; }
    }

    public interface IPokerService
    {
        List<TableInfoDto> GetLobbyInfo();
        void JoinTable(string tableId, string connectionId, string userId, decimal chips = 0);
        void LeaveTable(string connectionId);
        void StartNewHand(string tableId);
        bool PlayerMove(string tableId, string userId, string action, decimal amount);
        PokerTable GetTable(string tableId);
        
    }
}