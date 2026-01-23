import React from 'react';
import '../styles/GameCard.css';

export type ThemeType = 'beginner' | 'advanced' | 'vip';

export interface CardDataNumeric {
    rank: number;
    suit: number;
}

export interface CardDataString {
    rank: string;
    suit: string;
}

export type CardData = CardDataNumeric | CardDataString;

export const Suit = {
    Hearts: 0,
    Diamonds: 1,
    Clubs: 2,
    Spades: 3
} as const;

const SUIT_SYMBOLS = ["♥", "♦", "♣", "♠"];
const RANK_SYMBOLS: { [key: number]: string } = { 
    1: "A", 
    11: "J", 
    12: "Q", 
    13: "K", 
    14: "A" 
};

function getSuitIndex(suit: number | string): number {
    if (typeof suit === 'number') return suit;
    const s = suit.toLowerCase();
    if (s.includes('heart') || s.includes('kier')) return 0;
    if (s.includes('diamond') || s.includes('daro')) return 1;
    if (s.includes('club') || s.includes('trefl')) return 2;
    if (s.includes('spade') || s.includes('pik')) return 3;
    return 0;
}

function getRankDisplay(rank: number | string): string {
    if (typeof rank === 'number') {
        return RANK_SYMBOLS[rank] || rank.toString();
    }
    const r = rank.toLowerCase();
    if (r === 'ace' || r === 'a' || r === '1') return 'A';
    if (r === 'king' || r === 'k') return 'K';
    if (r === 'queen' || r === 'q') return 'Q';
    if (r === 'jack' || r === 'j') return 'J';
    if (r === 'ten' || r === '10') return '10';
    if (r === 'nine' || r === '9') return '9';
    if (r === 'eight' || r === '8') return '8';
    if (r === 'seven' || r === '7') return '7';
    if (r === 'six' || r === '6') return '6';
    if (r === 'five' || r === '5') return '5';
    if (r === 'four' || r === '4') return '4';
    if (r === 'three' || r === '3') return '3';
    if (r === 'two' || r === '2') return '2';
    return rank.toString().toUpperCase();
}

interface GameCardProps {
    card?: CardData;
    hidden?: boolean;
    theme?: ThemeType;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    selected?: boolean;
    selectable?: boolean;
    onClick?: () => void;
    selectLabel?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ 
    card, 
    hidden = false, 
    theme = 'beginner',
    size = 'medium',
    className = '',
    selected = false,
    selectable = false,
    onClick,
    selectLabel = 'WYMIEŃ'
}) => {
    const cardClasses = [
        'game-card',
        `game-card-${size}`,
        selected ? 'game-card-selected' : '',
        selectable ? 'game-card-selectable' : '',
        className
    ].filter(Boolean).join(' ');

    if (!card || hidden) {
        return (
            <div 
                className={`${cardClasses} game-card-back game-card-${theme}`}
                onClick={selectable ? onClick : undefined}
            >
                <div className="game-card-back-pattern"></div>
            </div>
        );
    }

    const suitIndex = getSuitIndex(card.suit);
    const rankDisplay = getRankDisplay(card.rank);
    const isRed = suitIndex === 0 || suitIndex === 1; // Hearts or Diamonds
    const colorClass = isRed ? "game-card-red" : "game-card-black";

    return (
        <div 
            className={`${cardClasses} game-card-front ${colorClass}`}
            onClick={selectable ? onClick : undefined}
        >
            {selected && selectLabel && (
                <div className="game-card-select-badge">{selectLabel}</div>
            )}
            <div className="game-card-corner game-card-corner-tl">
                <span className="game-card-rank">{rankDisplay}</span>
                <span className="game-card-suit">{SUIT_SYMBOLS[suitIndex]}</span>
            </div>
            <div className="game-card-center">
                <span className="game-card-suit-large">{SUIT_SYMBOLS[suitIndex]}</span>
            </div>
            <div className="game-card-corner game-card-corner-br">
                <span className="game-card-rank">{rankDisplay}</span>
                <span className="game-card-suit">{SUIT_SYMBOLS[suitIndex]}</span>
            </div>
        </div>
    );
};

export default GameCard;
