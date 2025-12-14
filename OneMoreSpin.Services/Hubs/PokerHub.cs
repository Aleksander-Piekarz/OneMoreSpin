using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using OneMoreSpin.Services.ConcreteServices;
using OneMoreSpin.Services.Interfaces;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OneMoreSpin.Services.Hubs 
{
    [Authorize]
    public class PokerHub : Hub
    {
        private readonly IPokerService _pokerService;

        public PokerHub(IPokerService pokerService)
        {
            _pokerService = pokerService;
        }

        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            
            _pokerService.LeaveTable(Context.ConnectionId);
            
            await base.OnDisconnectedAsync(exception);
        }
        

        public async Task JoinTable(string tableId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId))
            {
                userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? Context.User?.FindFirst("sub")?.Value;
            }

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "Błąd: Nie znaleziono ID w tokenie.");
                return;
            }

            _pokerService.JoinTable(tableId, Context.ConnectionId, userId);

            await Groups.AddToGroupAsync(Context.ConnectionId, tableId);

            var table = _pokerService.GetTable(tableId);
            await Clients.Group(tableId).SendAsync("UpdateGameState", table);
            
            var player = table.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                await Clients.Group(tableId).SendAsync("PlayerJoined", player.Username);
            }
        }

        public async Task StartGame(string tableId)
        {
            _pokerService.StartNewHand(tableId);
            var table = _pokerService.GetTable(tableId);
            await Clients.Group(tableId).SendAsync("UpdateGameState", table);
        }

     public async Task<List<TableInfoDto>> GetTables()
        {
            
            return _pokerService.GetLobbyInfo();
        }
        public async Task MakeMove(string tableId, string action, decimal amount)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("sub")?.Value;
            bool success = _pokerService.PlayerMove(tableId, userId, action, amount);

            if (success)
            {
                var table = _pokerService.GetTable(tableId);
                await Clients.Group(tableId).SendAsync("UpdateGameState", table);
                
                var player = table.Players.FirstOrDefault(p => p.UserId == userId);
                var name = player?.Username ?? "Gracz";
                await Clients.Group(tableId).SendAsync("ActionLog", $"{name}: {action}");
            }
        }
        
    }
}