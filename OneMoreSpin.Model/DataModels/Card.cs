namespace OneMoreSpin.Model.DataModels;

public enum CardSuit
{
    Hearts,    // Serca
    Diamonds,  // Diamenty
    Clubs,     // Trefle
    Spades     // Piki
}

public enum CardRank
{
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14
}

public class Card
{
    public int Id { get; set; }
    public CardRank Rank { get; set; }
    public CardSuit Suit { get; set; }

    public Card() { }

    public Card(CardRank rank, CardSuit suit)
    {
        Rank = rank;
        Suit = suit;
    }

 
}
