import React, { useEffect, useState } from 'react';

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
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(2);
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId, title = 'Leaderboard', className }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const url = `/api/leaderboard/game/${gameId}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        const text = await resp.text();
        const data: Entry[] = JSON.parse(text);
        if (!cancelled) setEntries(data);
      } catch (e: any) {
        if (!cancelled) setError(`(gameId: ${gameId}) ${e?.message ?? 'Failed to load leaderboard'}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [gameId]);

  if (loading) {
    return <div className={className}>Loading {title}…</div>;
  }
  if (error) {
    return <div className={className}>Failed to load: {error}</div>;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Winnings</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={`${e.Email}-${i}`} className="border-b">
                <td className="py-2 px-3">{i + 1}</td>
                <td className="py-2 px-3">{e.Email}</td>
                <td className="py-2 px-3 text-right font-semibold">{formatMoney(e.MoneyWon)}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="py-3 px-3" colSpan={3}>No entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
