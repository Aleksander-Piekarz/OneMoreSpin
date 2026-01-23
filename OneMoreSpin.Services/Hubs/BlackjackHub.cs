using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using OneMoreSpin.Services.Interfaces;

namespace OneMoreSpin.Services.Hubs
{
    /// <summary>
    /// SignalR Hub dla wieloosobowego Blackjacka.
    /// Obsługuje komunikację real-time: dołączanie do stołu, obstawianie,
    /// akcje graczy (hit, stand, double), synchronizację stanu gry.
    /// Do 5 graczy przy jednym stole przeciwko krupierowi.
    /// </summary>
    [Authorize]
    public class BlackjackHub : Hub
    {
        private readonly IMultiplayerBlackjackService _blackjackService;

        public BlackjackHub(IMultiplayerBlackjackService blackjackService)
        {
            _blackjackService = blackjackService;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _blackjackService.LeaveTable(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task LeaveTable(string tableId)
        {
            var table = _blackjackService.GetTable(tableId);
            var player = table?.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            string username = player?.Username ?? "Gracz";
            
            _blackjackService.LeaveTable(Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, tableId);
            
            var updatedTable = _blackjackService.GetTable(tableId);
            if (updatedTable != null)
            {
                await Clients.Group(tableId).SendAsync("UpdateGameState", updatedTable);
                await Clients.Group(tableId).SendAsync("PlayerLeft", username);
            }
        }

        public async Task JoinTable(string tableId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId))
            {
                userId =
                    Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? Context.User?.FindFirst("sub")?.Value;
            }

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "Błąd: Nie znaleziono ID w tokenie.");
                return;
            }

            _blackjackService.JoinTable(tableId, Context.ConnectionId, userId);

            await Groups.AddToGroupAsync(Context.ConnectionId, tableId);

            var table = _blackjackService.GetTable(tableId);
            if (table == null) return;
            
            await Clients.Group(tableId).SendAsync("UpdateGameState", table);

            var player = table.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                await Clients.Group(tableId).SendAsync("PlayerJoined", player.Username);
            }
        }

        public async Task PlaceBet(string tableId, decimal amount)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("sub")?.Value ?? "";
            bool success = _blackjackService.PlaceBet(tableId, userId, amount);

            if (success)
            {
                var table = _blackjackService.GetTable(tableId);
                await Clients.Group(tableId).SendAsync("UpdateGameState", table);
            }
        }

        public async Task StartRound(string tableId)
        {
            _blackjackService.StartRound(tableId);
            var table = _blackjackService.GetTable(tableId);
            await Clients.Group(tableId).SendAsync("UpdateGameState", table);
        }

        public async Task<List<BlackjackTableInfoDto>> GetTables()
        {
            return _blackjackService.GetLobbyInfo();
        }

        public async Task Hit(string tableId)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("sub")?.Value ?? "";
            bool success = _blackjackService.PlayerHit(tableId, userId);

            if (success)
            {
                var table = _blackjackService.GetTable(tableId);
                await Clients.Group(tableId).SendAsync("UpdateGameState", table);
            }
        }

        public async Task Stand(string tableId)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("sub")?.Value ?? "";
            bool success = _blackjackService.PlayerStand(tableId, userId);

            if (success)
            {
                var table = _blackjackService.GetTable(tableId);
                await Clients.Group(tableId).SendAsync("UpdateGameState", table);
            }
        }

        public async Task Double(string tableId)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("sub")?.Value ?? "";
            bool success = _blackjackService.PlayerDouble(tableId, userId);

            if (success)
            {
                var table = _blackjackService.GetTable(tableId);
                await Clients.Group(tableId).SendAsync("UpdateGameState", table);
            }
        }

        public async Task SendMessage(string tableId, string message)
        {
            Console.WriteLine($"[BLACKJACK CHAT] TableId: {tableId}, Message: {message}");

            if (string.IsNullOrWhiteSpace(message))
                return;

            var table = _blackjackService.GetTable(tableId);
            if (table == null)
                return;

            var player = table.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);

            string username = player?.Username ?? Context.User?.Identity?.Name ?? "Obserwator";

            await Clients.Group(tableId).SendAsync("ReceiveMessage", username, message);
        }
    }
}
