import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/SinglePokerPage.css';
import { api } from '../api';
import type { UserInfo } from '../api';
import DemoToggle from '../components/DemoToggle';
import { fireConfetti } from '../utils/confetti';
import Leaderboard from '../components/Leaderboard';
import { GameCard } from '../components/GameCard';

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
  const { t } = useLanguage();
  const [session, setSession] = useState<PokerSessionVm | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [betAmount, setBetAmount] = useState<number>(10);
  const [balance, setBalance] = useState<number | null>(null);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  
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
      const vm = await api.poker.start(betAmount, unlimitedMode) as PokerSessionVm;
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
      const updated = await api.poker.draw(session.id, indices, unlimitedMode) as PokerSessionVm;
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



  return (
    <div className="sp-poker-page leaderboard-host">
      <div className="sp-animated-bg">
        <div className="sp-floating-shape sp-shape-1"></div>
        <div className="sp-floating-shape sp-shape-2"></div>
        <div className="sp-floating-shape sp-shape-3"></div>
        <div className="sp-floating-shape sp-shape-4"></div>
        <div className="sp-floating-shape sp-shape-5"></div>
      </div>
      <div className="sp-poker-container">
        {/* HEADER */}
        <div className="sp-poker-header slots-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
            <span>POWRÓT</span>
          </button>

          <h1 className="slots-title">
            <span className="title-word">ROYAL</span>
            <span className="title-word">POKER</span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DemoToggle checked={unlimitedMode} onChange={setUnlimitedMode} />
            <div className="balance-display">
               <i className="fas fa-coins"></i>
               <span>{formatNumberWithSpaces(balance)} PLN</span>
            </div>
          </div>
        </div>

        {/* STÓŁ DO GRY */}
        <div className="sp-poker-table-wrapper">
          <div className="sp-poker-table-felt">

            {/* --- SEKCJA DEALERA (GÓRA) --- */}
            <div className="sp-dealer-section">
              {session && isGameFinished ? (
                <>
                  <div className="sp-dealer-label">{t('games.poker.yourCards')}</div>
                  <div className="sp-dealer-hand-wrapper">
                    {session.dealerHand.map((card, idx) => (
                      <GameCard 
                        key={`d-${idx}`} 
                        card={card}
                        size="small"
                      />
                    ))}
                  </div>
                  <div className="sp-rank-badge sp-dealer-rank-badge sp-active">
                    {formatRank(session.dealerHandRank)}
                  </div>
                </>
              ) : (
                /* Pusty stan ma tę samą wysokość co pełny w CSS, więc nie skacze */
                 <div className="sp-dealer-label" style={{opacity: 0}}>{t('games.poker.waiting')}</div>
              )}
            </div>

            {/* --- INFO ŚRODEK (Zamiast absolutnego pozycjonowania, jest w flow) --- */}
            <div className="sp-table-center-info">
              {message ? (
                <div className="sp-game-message sp-error">{message}</div>
              ) : (
                <>
                  {!session && <div className="sp-game-message sp-hint">{t('games.poker.dealToStart')}</div>}
                  {session && !isGameFinished && (
                    <div className="sp-game-message sp-hint">
                      {selected.size > 0 ? t('games.poker.selectedCards').replace('{{count}}', selected.size.toString()) : t('games.poker.selectCards')}
                    </div>
                  )}
                  {session && isGameFinished && (
                    /* Używamy zwykłego tekstu, nie absolute, żeby nie skakało */
                    <div className={`sp-result-text ${hasWon ? 'sp-win' : 'sp-lose'}`}>
                      {hasWon ? t('games.poker.win') : t('games.poker.lose')}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* --- SEKCJA GRACZA (DÓŁ) --- */}
            <div className="sp-player-section">
              {/* Tutaj wyświetlamy układ gracza (Twoja prośba) */}
              {session && (
                <div className="sp-rank-badge sp-player-rank-badge">
                  {formatRank(session.playerHandRank || 'Rozdanie')}
                </div>
              )}

              <div className="sp-hand-display">
                {session ? (
                  session.playerHand.map((card, idx) => (
                    <GameCard 
                      key={`${card.rank}-${card.suit}-${idx}`} 
                      card={card}
                      size="medium"
                      selected={selected.has(idx)}
                      selectable={!isGameFinished && !loading}
                      onClick={() => toggleSelect(idx)}
                    />
                  ))
                ) : (
                  [1,2,3,4,5].map(i => <div key={i} className="sp-card-slot"></div>)
                )}
              </div>
            </div>

            {/* --- PANEL STEROWANIA --- */}
            <div className="sp-controls-bar">
              {(!session || isGameFinished) ? (
                <>
                   {/* Grupa stawki obok przycisku startu */}
                  <div className="sp-bet-control-group">
                    <button className="sp-bet-btn-small" onClick={() => setBetAmount(Math.max(10, betAmount - 10))}>-</button>
                    <div className="sp-bet-info">
                      <span className="sp-bet-label">STAWKA</span>
                      <span className="sp-bet-amount">{betAmount}</span>
                    </div>
                    <button className="sp-bet-btn-small" onClick={() => setBetAmount(betAmount + 10)}>+</button>
                  </div>

                  <button className="sp-main-btn sp-btn-deal" onClick={startSession} disabled={loading}>
                    {loading ? t('games.poker.dealing') : t('games.poker.dealCards')}
                  </button>
                </>
              ) : (
                <>
                  <button className="sp-main-btn sp-btn-action" onClick={confirmDiscard} disabled={loading}>
                    {loading 
                      ? 'WYMIENIAM...' 
                      : (selected.size === 0 ? t('games.poker.check') : t('games.poker.exchange'))}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
        
      </div>

      <div className={`leaderboard-drawer ${leaderboardOpen ? 'open' : 'closed'}`}>
        <div className="leaderboard-panel">
          <Leaderboard gameId={4} title="🏆 TOP WINS" className="leaderboard-widget" />
        </div>
        <button
          className="leaderboard-toggle"
          onClick={() => setLeaderboardOpen((prev) => !prev)}
          aria-expanded={leaderboardOpen}
          title={leaderboardOpen ? t('games.poker.hideLeaderboard') : t('games.poker.showLeaderboard')}
        >
          <i className="fas fa-trophy"></i>
          <span>TOP</span>
        </button>
      </div>
    </div>
  );
}
