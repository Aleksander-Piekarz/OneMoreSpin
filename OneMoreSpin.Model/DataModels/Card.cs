using System;

namespace OneMoreSpin.Model.DataModels
{
    // Te enumy możesz zostawić w tym samym pliku lub przenieść do np. OneMoreSpin.Model/Enums
    public enum Suit { Hearts, Diamonds, Clubs, Spades }
    public enum Rank
    {
        Two = 2, Three, Four, Five, Six, Seven, Eight, Nine, Ten,
        Jack = 11, Queen = 12, King = 13, Ace = 14
    }

    public class Card
    {
        public Suit Suit { get; set; }
        public Rank Rank { get; set; }

        // Konstruktor bezparametrowy może się przydać przy serializacji JSON
        public Card() { }

        public Card(Rank rank, Suit suit)
        {
            Rank = rank;
            Suit = suit;
        }

        public override string ToString() => $"{Rank} of {Suit}";
    }
}