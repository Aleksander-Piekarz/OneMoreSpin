export const Suit = {
    Hearts: 0,
    Diamonds: 1,
    Clubs: 2,
    Spades: 3
} as const;

export type Suit = typeof Suit[keyof typeof Suit];

export const Rank = {
    Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10,
    Jack: 11, Queen: 12, King: 13, Ace: 14
} as const;

export type Rank = typeof Rank[keyof typeof Rank];

export interface Card {
    suit: Suit;
    rank: Rank;
}

export interface BlackjackPlayer {
    connectionId: string;
    userId: string;
    username: string;
    chips: number;
    currentBet: number;
    hand: Card[];
    seatIndex: number;
    score: number;
    hasStood: boolean;
    hasBusted: boolean;
    hasBlackjack: boolean;
    hasDoubledDown: boolean;
    isVip: boolean;
    result: string;
    payout: number;
}

export interface BlackjackTable {
    id: string;
    players: BlackjackPlayer[];
    dealerHand: Card[];
    dealerScore: number;
    dealerBusted: boolean;
    dealerHasBlackjack: boolean;
    minBet: number;
    currentPlayerIndex: number;
    stage: string;
    gameInProgress: boolean;
    playersReady: number;
    bettingCountdown?: number;
    waitingForBets?: boolean;
}
