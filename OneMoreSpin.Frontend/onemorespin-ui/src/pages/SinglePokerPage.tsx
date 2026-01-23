import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/PokerPage.css';
import '../styles/GameHeader.css';
import { api } from '../api';
import type { UserInfo } from '../api';
import DemoToggle from '../components/DemoToggle';
import { fireConfetti } from '../utils/confetti';
import Leaderboard from '../components/Leaderboard';
import { GameCard, type ThemeType } from '../components/GameCard';

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
  
  const currentTheme: ThemeType = 'beginner';
  
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
    <div className="poker-container leaderboard-host">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <header className="game-header">
        <div className="game-header-left">
          <button className="game-back-btn" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i>
            <span>{t('common.back')}</span>
          </button>
        </div>
        <div className="game-header-center">
          <div className="game-title">
            <span className="game-title-word">ROYAL</span>
            <span className="game-title-word">POKER</span>
          </div>
        </div>
        <div className="game-header-right">
          <DemoToggle checked={unlimitedMode} onChange={setUnlimitedMode} />
          <div className="game-balance-display">
            <i className="fas fa-coins"></i>
            <span>{formatNumberWithSpaces(balance)} PLN</span>
          </div>
        </div>
      </header>

      <div className="poker-game-wrapper">
        <div className={`poker-table table-theme-${currentTheme}`}>
          <div className="table-center-content">
            {(message || (session && !isGameFinished)) && (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px 16px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '12px'}}>
                {message ? (
                  <span style={{color: '#f44336', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase'}}>{message}</span>
                ) : !isGameFinished && session && (
                  <span style={{color: '#43e97b', fontSize: '17px', fontWeight: '600'}}>
                    {selected.size > 0 ? t('games.poker.selectedCards').replace('{{count}}', selected.size.toString()) : t('games.poker.selectCards')}
                  </span>
                )}
              </div>
            )}
            
            {session && isGameFinished && session.dealerHandRank && (
              <div style={{width: '100%', textAlign: 'center'}}>
                <span style={{color: '#ffd700', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px', textShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'}}>
                  Dealer: {formatRank(session.dealerHandRank)}
                </span>
              </div>
            )}
            
            <div className="community-cards" style={{marginTop: '-5px'}}>
              {session && isGameFinished && session.dealerHand.map((card, idx) => (
                <GameCard key={`d-${idx}`} card={card} theme={currentTheme} size="large" />
              ))}
              {!session || !isGameFinished ? (
                <div className="empty-flop-slot">DEALER</div>
              ) : null}
            </div>
          </div>
          
          {session && isGameFinished && (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px 20px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '16px', margin: '10px 0', zIndex: 100}}>
              <span style={{color: hasWon ? '#43e97b' : '#f44336', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', textShadow: `0 3px 12px ${hasWon ? 'rgba(67, 233, 123, 0.6)' : 'rgba(244, 67, 54, 0.6)'}`}}>
                {hasWon ? t('games.poker.win') : t('games.poker.lose')}
              </span>
            </div>
          )}

          <div className="poker-players-container">
            <div className="player-seat is-me">
              <div className="player-cards">
                {session ? (
                  session.playerHand.map((card, idx) => (
                    <GameCard 
                      key={`${card.rank}-${card.suit}-${idx}`} 
                      card={card}
                      size="large"
                      theme={currentTheme}
                      selected={selected.has(idx)}
                      selectable={!isGameFinished && !loading}
                      onClick={() => toggleSelect(idx)}
                    />
                  ))
                ) : (
                  [1,2,3,4,5].map(i => <GameCard key={i} theme={currentTheme} size="large" />)
                )}
              </div>
              
              <div className="player-stats">
                {session?.playerHandRank && (
                  <span style={{color: '#43e97b', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', marginTop: '4px', display: 'block', textAlign: 'center', width: '100%'}}>
                    {formatRank(session.playerHandRank)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        {(!session || isGameFinished) ? (
          <>
            <div className="raise-control">
              <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="poker-btn btn-fold">-10</button>
              <input
                type="number"
                className="raise-input"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                min={10}
                step={10}
              />
              <button onClick={() => setBetAmount(betAmount + 10)} className="poker-btn btn-check">+10</button>
            </div>

            <button className="poker-btn btn-raise" onClick={startSession} disabled={loading}>
              {loading ? t('games.poker.dealing') : t('games.poker.dealCards')}
            </button>
          </>
        ) : (
          <button className="poker-btn btn-raise" onClick={confirmDiscard} disabled={loading}>
            {loading 
              ? 'WYMIENIAM...' 
              : (selected.size === 0 ? t('games.poker.check') : t('games.poker.exchange'))}
          </button>
        )}
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
          <span>TOP</span>
        </button>
      </div>
    </div>
  );
}
