import React, { useEffect, useState } from 'react';
import { api } from '../api';
import '../styles/Leaderboard.css';
type Entry = {
  Email: string;
  MoneyWon: number;
};

interface LeaderboardProps {
  gameId?: number;
  gameName?: string;
  title?: string;
  className?: string;
}

const formatMoney = (value: number): string => {
  const amount = Number.isFinite(value) ? value : 0;
  if (amount >= 1e9) return (amount / 1e9).toFixed(1) + ' B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(1) + ' M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(1) + ' k';
  return amount.toFixed(0);
};

// Funkcja maskująca email (np. al***@gmail.com) dla prywatności
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || name.length < 3) return email;
  return `${name.substring(0, 2)}***@${domain}`;
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId, gameName, title = 'TOP WINS', className }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[Leaderboard] Fetching data...', { gameId, gameName });
        
        let data;
        if (gameName) {
          data = await api.leaderboard.getByGameName(gameName);
        } else if (gameId !== undefined) {
          data = await api.leaderboard.getByGameId(gameId);
        } else {
          throw new Error("Brak gameId lub gameName");
        }

        console.log('[Leaderboard] Received data:', data);

        if (!cancelled) {
          if (!Array.isArray(data)) {
            console.error("Leaderboard: unexpected data format", data);
            throw new Error("Błąd danych");
          }

          const normalized = data.map((item) => ({
            ...item,
            MoneyWon: Number((item as any).MoneyWon) || 0
          }));

          const sorted = normalized.sort((a, b) => b.MoneyWon - a.MoneyWon).slice(0, 10);
          console.log('[Leaderboard] Sorted entries:', sorted);
          setEntries(sorted);
        }
      } catch (e: any) {
        console.error("Leaderboard error:", e);
        if (!cancelled) setError(e?.message || "Błąd ładowania");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000); // Odświeżaj co 30 sekund
    return () => { 
      cancelled = true; 
      clearInterval(interval);
    };
  }, [gameId, gameName]);

  return (
    <div className={`casino-leaderboard ${className || ''}`}>
      <div className="leaderboard-header">
        <span>{title}</span>
      </div>

      <div className="leaderboard-content">
        {loading && entries.length === 0 ? (
          <div className="leaderboard-status">Ładowanie...</div>
        ) : error ? (
          <div className="leaderboard-status error">{error}</div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-status">Brak wyników</div>
        ) : (
          <table className="leaderboard-table">
            <tbody>
              {entries.map((e, i) => (
                <tr key={`${e.Email}-${i}`} className={i === 0 ? 'top-1' : ''}>
                  <td className="rank">#{i + 1}</td>
                  <td className="user">{maskEmail(e.Email)}</td>
                  <td className="amount">{formatMoney(e.MoneyWon)} PLN</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;