using System;
using System.Collections.Generic;

namespace OneMoreSpin.Model.DataModels
{
    // Klasa reprezentująca gracza w multiplayer blackjacku
    public class BlackjackPlayer
    {
        public string ConnectionId { get; set; } = "";
        public string UserId { get; set; } = "";
        public string Username { get; set; } = "";
        public decimal Chips { get; set; }
        public decimal CurrentBet { get; set; }
        public List<Card> Hand { get; set; } = new List<Card>();
        public int SeatIndex { get; set; } = -1;
        public int Score { get; set; }
        public bool HasStood { get; set; }
        public bool HasBusted { get; set; }
        public bool HasBlackjack { get; set; }
        public bool HasDoubledDown { get; set; }
        public bool IsVip { get; set; } // VIP status for special display
        public string Result { get; set; } = ""; // "Win", "Lose", "Push", "Blackjack"
        public decimal Payout { get; set; }

        public BlackjackPlayer(string connectionId, string username, decimal initialChips)
        {
            ConnectionId = connectionId;
            Username = username;
            Chips = initialChips;
        }
    }

    // Klasa reprezentująca stół blackjackowy
    public class BlackjackTable
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public List<BlackjackPlayer> Players { get; set; } = new List<BlackjackPlayer>();
        public List<Card> Deck { get; set; } = new List<Card>();
        
        // Dealer
        public List<Card> DealerHand { get; set; } = new List<Card>();
        public int DealerScore { get; set; }
        public bool DealerBusted { get; set; }
        public bool DealerHasBlackjack { get; set; }

        public decimal MinBet { get; set; } = 10;
        public int CurrentPlayerIndex { get; set; } = -1;
        
        // Stage: "Waiting", "Betting", "Dealing", "PlayerTurns", "DealerTurn", "Showdown"
        public string Stage { get; set; } = "Waiting";
        public bool GameInProgress { get; set; } = false;
        public int PlayersReady { get; set; } = 0;
    }
}
