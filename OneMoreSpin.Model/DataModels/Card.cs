using System;

namespace OneMoreSpin.Model.DataModels
{
    public enum Suit
    {
        Hearts,
        Diamonds,
        Clubs,
        Spades,
    }

    public enum Rank
    {
        Two = 2,
        Three,
        Four,
        Five,
        Six,
        Seven,
        Eight,
        Nine,
        Ten,
        Jack = 11,
        Queen = 12,
        King = 13,
        Ace = 14,
    }

    public class Card
    {
        public Suit Suit { get; set; }
        public Rank Rank { get; set; }

        public Card() { }

        public Card(Rank rank, Suit suit)
        {
            Rank = rank;
            Suit = suit;
        }

        public override string ToString() => $"{Rank} of {Suit}";
    }
}
