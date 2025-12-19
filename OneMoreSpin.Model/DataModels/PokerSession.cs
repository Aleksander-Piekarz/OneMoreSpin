using System;
using System.Collections.Generic;

namespace OneMoreSpin.Model.DataModels
{
    // Klasa reprezentująca gracza TYLKO na czas gry w pokera
    public class PokerPlayer
    {
        public string ConnectionId { get; set; }
        public string UserId { get; set; } = "";
        public string Username { get; set; } = "";
        public decimal Chips { get; set; }
        public decimal CurrentBet { get; set; }
        public bool IsFolded { get; set; } = false;
        public bool IsVip { get; set; } = false; // VIP status for special display
        public List<Card> Hand { get; set; } = new List<Card>();
        public int SeatIndex { get; set; } = -1;

        public PokerPlayer() { } // Parameterless constructor for serialization
        
        public PokerPlayer(string connectionId, string username, decimal initialChips)
        {
            ConnectionId = connectionId;
            Username = username;
            Chips = initialChips;
            IsVip = false;
        }
    }

    // Klasa reprezentująca stół
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

        public string Stage { get; set; } = "Waiting"; // Waiting, PreFlop, Flop, Turn, River, Showdown
        public bool GameInProgress { get; set; } = false;

        // Licznik, ilu graczy wykonało ruch w tej rundzie licytacji
        public int ActionsTakenInRound { get; set; } = 0;
    }
}
