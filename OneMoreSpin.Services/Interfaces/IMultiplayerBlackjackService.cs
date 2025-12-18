using OneMoreSpin.Model.DataModels;
using System.Collections.Generic;

namespace OneMoreSpin.Services.Interfaces
{
    // DTO do przesyłania info o stołach blackjackowych
    public class BlackjackTableInfoDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public int PlayersCount { get; set; }
        public decimal MinBet { get; set; }
    }

    public interface IMultiplayerBlackjackService
    {
        List<BlackjackTableInfoDto> GetLobbyInfo();
        void JoinTable(string tableId, string connectionId, string userId);
        void LeaveTable(string connectionId);
        bool PlaceBet(string tableId, string userId, decimal amount);
        void StartRound(string tableId);
        bool PlayerHit(string tableId, string userId);
        bool PlayerStand(string tableId, string userId);
        bool PlayerDouble(string tableId, string userId);
        BlackjackTable? GetTable(string tableId);
    }
}
