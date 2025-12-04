import React, { useEffect, useState } from 'react';
import '../styles/PokerGame.css';
import { api } from '../api';
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
  playerWon: boolean;
};




export default function PokerGame() {
  const [session, setSession] = useState<PokerSessionVm | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [betAmount, setBetAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // trigger confetti when player wins
    if (session?.playerWon) {
      try { fireConfetti(); } catch (e) { /* ignore in tests */ }
    }
  }, [session?.playerWon]);

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
        <div className="header-row">
          <div>
            <div className="poker-title">Poker 5-kartowy (dobierany)</div>
            <div className="small-muted">Klasyczna rozgrywka — wymień do 4 kart</div>
          </div>
          <div className="poker-top">
            <div className="poker-balance">Saldo: <strong>—</strong></div>
            <div className="poker-controls">
              <label>
                Zakład:
                <input className="bet-input"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={1}
                />
              </label>
              <button onClick={startSession} disabled={loading} className="btn-primary" aria-label="Start gry">
                Start
              </button>
            </div>
          </div>
        </div>

        {message && <div className="message">{message}</div>}
        {!tokenPresent && <div className="message">Brak tokena autoryzacji — zaloguj się.</div>}

        <div className="table-wrap">
          <div className="poker-table">
            <div className="table-felt">
              <div className="table-center">
                <div className="pot">
                  <div className="label">Pula</div>
                  <div className="amount">{0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poker-root">
      <div className="header-row">
        <div>
          <div className="poker-title">Poker 5-kartowy</div>
          <div className="small-muted">Sesja #{session.id}</div>
        </div>
        <div className="poker-top">
          <div className="poker-balance">Zakład: <strong>{session.betAmount}</strong></div>
          <div className="poker-controls">
            <button className="btn-ghost" onClick={() => { setSession(null); setSelected(new Set()); }}>Zakończ</button>
            <div className="small-muted">Wygrana: <strong style={{color: 'var(--gold)'}}>{session.winAmount}</strong></div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="poker-table">
          <div className="table-felt">
            <div className="dealer-area">
              <div className="hand">
                {session.dealerHand.map((c, i) => (
                  <div
                    key={i}
                    className={`card dealer-card ${session.playerHandRank ? 'revealed' : 'face-down'}`}
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

            <div className="table-center">
              <div className="pot">
                <div className="label">Pula</div>
                <div className="amount">{session.betAmount}</div>
              </div>
            </div>

            <div className="player-area">
              <div className="hand">
                {session.playerHand.map((c, i) => (
                  <div
                    key={c.id}
                    onClick={() => toggleSelect(i)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected.has(i)}
                    className={`card ${selected.has(i) ? 'selected' : ''}`}
                  >
                    <div className="rank">{c.rank}</div>
                    <div className="suit">{suitSymbol(c.suit)}</div>
                    <div className="card-id">(id:{c.id})</div>
                  </div>
                ))}
              </div>

              <div style={{marginTop:12, display:'flex', gap:12, justifyContent:'center'}}>
                <button onClick={confirmDiscard} disabled={loading} className="btn-primary" aria-label="Wymień wybrane karty">Wymień ({selected.size})</button>
                <button onClick={() => { setSelected(new Set()); }} className="btn-ghost">Anuluj wybór</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {session.playerHandRank && (
        <div className={`result-banner ${session.playerWon ? 'win' : 'lose'}`} role="status">
          <div>{session.playerWon ? `Wygrałeś ${session.winAmount}` : `Przegrałeś`}</div>
          <div style={{marginLeft:12}} className="small-muted">Twoja ręka: {session.playerHandRank} — Krupier: {session.dealerHandRank}</div>
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
