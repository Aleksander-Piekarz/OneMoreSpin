import React, { useState } from 'react';
import '../styles/PokerGame.css';
import { api } from '../api';

type CardVm = { id: number; rank: string; suit: string };
type PokerSessionVm = {
  id: number;
  playerHand: CardVm[];
  dealerHand: CardVm[];
  playerHandRank?: string;
  dealerHandRank?: string;
  betAmount: number;
  winAmount: number;
  playerWon: boolean;
};




export default function PokerGame() {
  const [session, setSession] = useState<PokerSessionVm | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [betAmount, setBetAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startSession() {
    setLoading(true);
    setMessage(null);
    try {
      const vm = await api.poker.start(betAmount) as PokerSessionVm;
      setSession(vm);
      setSelected(new Set());
    } catch (err: any) {
      setMessage(err.message || 'Błąd startu');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(idx: number) {
    if (!session) return;
    const newSet = new Set(selected);
    if (newSet.has(idx)) newSet.delete(idx);
    else {
      if (newSet.size >= 4) return; // max 4
      newSet.add(idx);
    }
    setSelected(newSet);
  }

  async function confirmDiscard() {
    if (!session) return;
    const indices = Array.from(selected).sort((a, b) => a - b);
    if (indices.length === 0) {
      setMessage('Wybierz karty do wymiany');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const updated = await api.poker.draw(session.id, indices) as PokerSessionVm;
      setSession(updated);
      setSelected(new Set());
    } catch (err: any) {
      setMessage(err.message || 'Błąd wymiany');
    } finally {
      setLoading(false);
    }
  }

  const tokenPresent = Boolean(localStorage.getItem('jwt') || localStorage.getItem('authToken'));
  // show a small debug hint when token is missing

  if (!session) {
    return (
      <div className="poker-root">
        <h2>Poker 5-kartowy (dobierany)</h2>
        <div className="poker-balance">Saldo: {/* render user balance from global state or fetch */}</div>
        <div className="poker-controls">
          <label>
            Zakład:
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
            />
          </label>
          <button onClick={startSession} disabled={loading} className="btn-primary">
            Start
          </button>
        </div>
        {message && <div className="message">{message}</div>}
        {!tokenPresent && <div className="message">Brak tokena autoryzacji — zaloguj się.</div>}
      </div>
    );
  }

  return (
    <div>
      <h2>Sesja #{session.id}</h2>
      <div>
        Zakład: {session.betAmount} &nbsp; Wygrana: {session.winAmount}
      </div>

      <div className="poker-layout">
        <div className="player-area">
          <h3>Twoje karty</h3>
          <div className="hand">
            {session.playerHand.map((c, i) => (
              <div
                key={c.id}
                onClick={() => toggleSelect(i)}
                className={`card ${selected.has(i) ? 'selected' : ''}`}
              >
                <div className="rank">{c.rank}</div>
                <div className="suit">{suitSymbol(c.suit)}</div>
                <div className="card-id">(id:{c.id})</div>
              </div>
            ))}
          </div>
          <button onClick={confirmDiscard} disabled={loading}>
            Wymień ({selected.size})
          </button>
        </div>
        <div className="dealer-area">
          <h3>Krupier</h3>
          <div className="hand">
            {session.dealerHand.map((c, i) => (
              <div
                key={i}
                className={`card dealer-card ${session.playerHandRank ? '' : 'face-down'}`}
              >
                {session.playerHandRank ? (
                  <>
                    <div className="rank">{c.rank}</div>
                    <div className="suit">{suitSymbol(c.suit)}</div>
                  </>
                ) : (
                  <div className="face-back">🂠</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {session.playerHandRank && (
        <div>
          <h4>Wynik</h4>
          <div>Twoja ręka: {session.playerHandRank}</div>
          <div>Krupier: {session.dealerHandRank}</div>
          <div>{session.playerWon ? `Wygrałeś ${session.winAmount}` : `Przegrałeś`}</div>
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
}

function suitSymbol(suit: string) {
  return suit.toLowerCase() === 'hearts' ? '♥'
       : suit.toLowerCase() === 'diamonds' ? '♦'
       : suit.toLowerCase() === 'clubs' ? '♣'
       : suit.toLowerCase() === 'spades' ? '♠'
       : '?';
}
