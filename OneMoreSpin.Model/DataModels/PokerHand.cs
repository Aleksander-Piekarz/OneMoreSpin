namespace OneMoreSpin.Model.DataModels;

public enum PokerHandRank
{
    HighCard = 0,
    OnePair = 1,
    TwoPair = 2,
    ThreeOfAKind = 3,
    Straight = 4,
    Flush = 5,
    FullHouse = 6,
    FourOfAKind = 7,
    StraightFlush = 8,
    RoyalFlush = 9
}

public class PokerHand
{
    public List<Card> Cards { get; set; } = [];
    public PokerHandRank Rank { get; set; }
    public string RankDescription { get; set; } = string.Empty;
    public int HandValue { get; set; } 
    public PokerHand() { }
}

