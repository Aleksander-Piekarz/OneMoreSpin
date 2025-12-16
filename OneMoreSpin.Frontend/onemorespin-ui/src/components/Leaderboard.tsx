import React, { useEffect, useState } from 'react';
import { api } from '../api';
import '../styles/Leaderboard.css';
type Entry = {
  Email: string;
  MoneyWon: number;
};

interface LeaderboardProps {
  gameId: number;
  title?: string;
  className?: string;
}

const formatMoney = (value: number): string => {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'k';
  return value.toFixed(0);
};

// Funkcja maskująca email (np. al***@gmail.com) dla prywatności
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || name.length < 3) return email;
  return `${name.substring(0, 2)}***@${domain}`;
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId, title = 'TOP WINS', className }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.leaderboard.getByGameId(gameId);

        if (!cancelled) {
          if (!Array.isArray(data)) {
            throw new Error("Błąd danych");
          }
          // Sortujemy malejąco po wygranej i bierzemy top 5, żeby nie zajmowało za dużo miejsca
          const sorted = data.sort((a, b) => b.MoneyWon - a.MoneyWon).slice(0, 5);
          setEntries(sorted);
        }
      } catch (e: any) {
        if (!cancelled) setError("Błąd ładowania");
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
  }, [gameId]);

  return (
    <div className={`casino-leaderboard ${className || ''}`}>
      <div className="leaderboard-header">
        <i className="fas fa-trophy"></i>
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
                  <td className="amount">{formatMoney(e.MoneyWon)} $</td>
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