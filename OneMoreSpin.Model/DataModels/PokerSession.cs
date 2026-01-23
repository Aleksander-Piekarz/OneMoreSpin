using System;
using System.Collections.Generic;

namespace OneMoreSpin.Model.DataModels
{
    public class PokerPlayer
    {
        public string ConnectionId { get; set; }
        public string UserId { get; set; } = "";
        public string Username { get; set; } = "";
        public decimal Chips { get; set; }
        public decimal CurrentBet { get; set; }
        public decimal TotalBetInHand { get; set; } = 0;
        public bool IsFolded { get; set; } = false;
        public bool IsVip { get; set; } = false;
        public bool IsReady { get; set; } = false;
        public List<Card> Hand { get; set; } = new List<Card>();
        public int SeatIndex { get; set; } = -1;

        public PokerPlayer() { }
        
        public PokerPlayer(string connectionId, string username, decimal initialChips)
        {
            ConnectionId = connectionId;
            Username = username;
            Chips = initialChips;
            IsVip = false;
        }
    }

    public class PokerTable
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public List<PokerPlayer> Players { get; set; } = new List<PokerPlayer>();
        public List<Card> Deck { get; set; } = new List<Card>();
        public List<Card> CommunityCards { get; set; } = new List<Card>();

        public decimal Pot { get; set; } = 0;
        public decimal CurrentMinBet { get; set; } = 0;

        public int CurrentPlayerIndex { get; set; } = 0;
        public int DealerIndex { get; set; } = 0;

        public string Stage { get; set; } = "Waiting";
        public bool GameInProgress { get; set; } = false;

        public int ActionsTakenInRound { get; set; } = 0;
        
        public string? WinnerId { get; set; } = null;
        public string? WinnerName { get; set; } = null;
        public string? WinHandName { get; set; } = null;
        public decimal WinAmount { get; set; } = 0;
        
        public int ReadyCountdown { get; set; } = 0;
        public bool WaitingForReady { get; set; } = false;
    }
}
