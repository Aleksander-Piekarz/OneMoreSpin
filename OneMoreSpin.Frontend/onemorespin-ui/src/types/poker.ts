// src/types/poker.ts

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

export interface PokerPlayer {
    connectionId: string;
    userId: string; // <--- DODAJ TO
    username: string;
    chips: number;
    currentBet: number;
    isFolded: boolean;
    isActive: boolean;
    hand: Card[]; 
}

export interface PokerTable {
    id: string;
    players: PokerPlayer[];
    communityCards: Card[];
    pot: number;
    currentMinBet: number;
    currentPlayerIndex: number;
    dealerIndex: number;
    stage: string;
    
    // --- NOWE POLA, KTÓRYCH BRAKOWAŁO ---
    gameInProgress: boolean;
    actionsTakenInRound: number;
}