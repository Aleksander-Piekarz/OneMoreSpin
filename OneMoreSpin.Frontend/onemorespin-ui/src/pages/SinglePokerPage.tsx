import { useEffect, useState } from 'react';
import '../styles/SinglePokerPage.css';
import { api } from '../api';
import type { UserInfo } from '../api';
import { fireConfetti } from '../utils/confetti';

type CardVm = { id: number; rank: string; suit: string };
type PokerSessionVm = {
  id: number;
  playerHand: CardVm[];
  dealerHand: CardVm[];
  playerHandRank?: string;
  dealerHandRank?: string;
  betAmount: number;
  winAmount: number;
  isWin?: boolean;
  playerWon?: boolean;
};

// Funkcja tłumacząca rangi
function formatRank(rank: string | undefined) {
  if (!rank) return '';
  const map: Record<string, string> = {
    'Royal Flush': 'Poker Królewski',
    'Straight Flush': 'Poker',
    'Four of a Kind': 'Kareta',
    'Full House': 'Full',
    'Flush': 'Kolor',
    'Straight': 'Strit',
    'Three of a Kind': 'Trójka',
    'Two Pair': 'Dwie Pary',
    'Pair': 'Para',
    'High Card': 'Wysoka Karta'
  };
  return map[rank] || rank.toUpperCase();
}

function formatNumberWithSpaces(n: number | null | undefined) {
  if (n === null || n === undefined) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function PokerGame() {
  const [session, setSession] = useState<PokerSessionVm | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [betAmount, setBetAmount] = useState<number>(10);
  const [balance, setBalance] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const hasWon = session ? (session.isWin || session.playerWon || session.winAmount > 0) : false;
  const isGameFinished = Boolean(session?.playerHandRank && session?.dealerHandRank);

  async function fetchMe() {
    try {
      const me = (await api.auth.me()) as UserInfo;
      setBalance(me.balance ?? null);
    } catch (e) { console.warn('Failed to fetch user info', e); }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (session && isGameFinished && !loading) {
      if (hasWon) { fireConfetti(); }
    }
  }, [session, loading, isGameFinished]);

  async function startSession() {
    if (loading) return;
    setLoading(true);
    setMessage(null);

    try {
      const vm = await api.poker.start(betAmount) as PokerSessionVm;
      setSession(vm);
      setSelected(new Set());
      fetchMe();
      setTimeout(() => setLoading(false), 600);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Błąd startu');
      setLoading(false);
    }
  }

  async function confirmDiscard() {
    if (!session || loading) return;
    const indices = Array.from(selected).sort((a, b) => a - b);
    
    setLoading(true);
    setMessage(null);

    try {
      const updated = await api.poker.draw(session.id, indices) as PokerSessionVm;
      setSession(updated);
      setSelected(new Set());
      fetchMe();
      setTimeout(() => setLoading(false), 600);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Błąd wymiany');
      setLoading(false);
    }
  }

  function toggleSelect(idx: number) {
    if (!session || loading || isGameFinished) return;
    const newSet = new Set(selected);
    if (newSet.has(idx)) newSet.delete(idx);
    else {
      if (newSet.size >= 4) return;
      newSet.add(idx);
    }
    setSelected(newSet);
  }

  const resetGame = () => {
    setSession(null);
    setSelected(new Set());
    setMessage(null);
    setLoading(false);
    
  };

  return (
    <div className="poker-page">
      <div className="poker-container">
        {/* HEADER */}
        <div className="poker-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => window.history.back()}>
              <i className="fas fa-chevron-left"></i> Powrót
            </button>
            <h1 className="poker-title">ROYAL POKER</h1>
          </div>
          <div className="balance-display">
             <span>{formatNumberWithSpaces(balance)} PLN</span>
          </div>
        </div>

        {/* STÓŁ DO GRY */}
        <div className="poker-table-wrapper">
          <div className="poker-table-felt">
            <div className="table-logo">POKER</div>

            {/* --- SEKCJA DEALERA (GÓRA) --- */}
            <div className="dealer-section">
              {session && isGameFinished ? (
                <>
                  <div className="dealer-label">Karty Krupiera</div>
                  <div className="dealer-hand-wrapper">
                    {session.dealerHand.map((card, idx) => (
                      <PokerCard 
                        key={`d-${idx}`} card={card} 
                        index={idx} mini disabled
                      />
                    ))}
                  </div>
                  <div className="rank-badge dealer-rank-badge active">
                    {formatRank(session.dealerHandRank)}
                  </div>
                </>
              ) : (
                /* Pusty stan ma tę samą wysokość co pełny w CSS, więc nie skacze */
                 <div className="dealer-label" style={{opacity: 0}}>Oczekiwanie...</div>
              )}
            </div>

            {/* --- INFO ŚRODEK (Zamiast absolutnego pozycjonowania, jest w flow) --- */}
            <div className="table-center-info">
              {message ? (
                <div className="game-message error">{message}</div>
              ) : (
                <>
                  {!session && <div className="game-message hint">Rozdaj karty, aby zagrać</div>}
                  {session && !isGameFinished && (
                    <div className="game-message hint">
                      {selected.size > 0 ? `Wybrano do wymiany: ${selected.size}` : 'Wybierz karty do wymiany'}
                    </div>
                  )}
                  {session && isGameFinished && (
                    /* Używamy zwykłego tekstu, nie absolute, żeby nie skakało */
                    <div className={`result-text ${hasWon ? 'win' : 'lose'}`}>
                      {hasWon ? 'WYGRANA!' : 'PRZEGRANA'}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* --- SEKCJA GRACZA (DÓŁ) --- */}
            <div className="player-section">
              {/* Tutaj wyświetlamy układ gracza (Twoja prośba) */}
              {session && (
                <div className="rank-badge player-rank-badge">
                  {formatRank(session.playerHandRank || 'Rozdanie')}
                </div>
              )}

              <div className="hand-display">
                {session ? (
                  session.playerHand.map((card, idx) => (
                    <PokerCard 
                      key={`${card.rank}-${card.suit}-${idx}`} 
                      card={card}
                      selected={selected.has(idx)}
                      onClick={() => toggleSelect(idx)}
                      disabled={isGameFinished || loading}
                      index={idx}
                    />
                  ))
                ) : (
                  [1,2,3,4,5].map(i => <div key={i} className="card-slot"></div>)
                )}
              </div>
            </div>

            {/* --- PANEL STEROWANIA --- */}
            <div className="controls-bar">
              {(!session || isGameFinished) ? (
                <>
                   {/* Grupa stawki obok przycisku startu */}
                  <div className="bet-control-group">
                    <button className="bet-btn-small" onClick={() => setBetAmount(Math.max(10, betAmount - 10))}>-</button>
                    <div className="bet-info">
                      <span className="bet-label">STAWKA</span>
                      <span className="bet-amount">{betAmount}</span>
                    </div>
                    <button className="bet-btn-small" onClick={() => setBetAmount(betAmount + 10)}>+</button>
                  </div>

                  <button className="main-btn btn-deal" onClick={startSession} disabled={loading}>
                    {loading ? 'TASOWANIE...' : 'ROZDAJ KARTY'}
                  </button>
                </>
              ) : (
                <>
                  <button className="main-btn btn-action" onClick={confirmDiscard} disabled={loading}>
                    {loading 
                      ? 'WYMIENIAM...' 
                      : (selected.size === 0 ? 'SPRAWDŹ' : 'WYMIEŃ KARTY')}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}

// --- Komponent Karty ---
function PokerCard({ card, selected, onClick, disabled, index, mini }: any) {
  const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
  const suitIcon = getSuitIcon(card.suit);
  
  return (
    <div 
      className={`poker-card ${selected ? 'selected' : ''} ${isRed ? 'red' : 'black'} ${mini ? 'mini' : ''}`}
      onClick={!disabled ? onClick : undefined}
      style={{ animationDelay: `${index * 0.1}s` }} 
    >
      {selected && !mini && <div className="discard-badge">WYMIEŃ</div>}
      
      <div className="card-inner">
        <div className="card-top">
          <span className="rank">{translateRank(card.rank)}</span>
          <span className="suit">{suitIcon}</span>
        </div>
        
        <div className="card-center-suit">{suitIcon}</div>
        
        <div className="card-bottom">
          <span className="rank">{translateRank(card.rank)}</span>
          <span className="suit">{suitIcon}</span>
        </div>
      </div>
    </div>
  );
}

function getSuitIcon(suit: string) {
  const s = suit.toLowerCase();
  if (s.includes('heart') || s.includes('kier')) return '♥';
  if (s.includes('diamond') || s.includes('daro')) return '♦';
  if (s.includes('club') || s.includes('trefl')) return '♣';
  if (s.includes('spade') || s.includes('pik')) return '♠';
  return '?';
}

function translateRank(rank: string) {
  const map: Record<string, string> = {
    'Ace': 'A', 'King': 'K', 'Queen': 'Q', 'Jack': 'J'
  };
  return map[rank] || rank;
}





