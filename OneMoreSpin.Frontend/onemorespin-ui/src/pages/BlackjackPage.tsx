import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { refreshMissions } from "../events";
import { fireConfetti } from "../utils/confetti";
import Leaderboard from "../components/Leaderboard";
import DemoToggle from "../components/DemoToggle";
import { GameHelpModal, BLACKJACK_HELP } from "../components/GameHelpModal";
import "../styles/BlackjackPage.css";
import { GameCard } from "../components/GameCard";
import "../styles/SinglePokerPage.css";

type BlackjackCardType = {
  rank: string;
  suit: string;
  value: number;
};

type GameState = {
  sessionId: number;
  playerHand: BlackjackCardType[];
  dealerHand: BlackjackCardType[];
  playerScore: number;
  dealerScore: number;
  gameState: string;
  result: string;
  bet: number;
  payout: number;
  balance: number;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  gameFinished: boolean;
};

function formatNumberWithSpaces(n: number | null | undefined) {
  if (n === null || n === undefined) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const BlackjackPage: React.FC = () => {
  const navigate = useNavigate();
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(0);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [error, setError] = useState<string>("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const isGameFinished = gameState?.gameFinished ?? false;
  const hasWon = gameState?.result === "PlayerWin" || gameState?.result === "Blackjack";

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchBalance = async () => {
      try {
        const userData = await api.auth.me();
        if (userData && (userData as any).balance !== undefined) {
          setBalance((userData as any).balance);
        }
      } catch (err) {
        console.error("Błąd pobierania balansu:", err);
      }
    };

    fetchBalance();
  }, [navigate]);

  useEffect(() => {
    if (gameState && isGameFinished && !isDealing) {
      if (hasWon) {
        fireConfetti();
      }
    }
  }, [gameState, isDealing, isGameFinished]);

  const startNewGame = async () => {
    if (bet <= 0) {
      setError("Wpisz kwotę większą niż 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!unlimitedMode && bet > balance) {
      setError("Niewystarczający balans");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsDealing(true);
    setError("");
    setGameState(null);

    try {
      const result = await api.blackjack.startWithMode(bet, unlimitedMode);
      
      setTimeout(() => {
        setGameState(result);
        if (!unlimitedMode) setBalance(result.balance);
        setIsDealing(false);
        refreshMissions();
      }, 600);
    } catch (err: any) {
      setIsDealing(false);
      setError(err.message || "Błąd podczas rozpoczynania gry");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleHit = async () => {
    if (!gameState) return;

    try {
      const result = await api.blackjack.hitWithMode(gameState.sessionId, unlimitedMode);
      setGameState(result);
      if (!unlimitedMode) setBalance(result.balance);

      if (result.gameFinished) {
        refreshMissions();
      }
    } catch (err: any) {
      setError(err.message || "Błąd podczas dobierania karty");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleStand = async () => {
    if (!gameState) return;

    try {
      const result = await api.blackjack.standWithMode(gameState.sessionId, unlimitedMode);
      setGameState(result);
      if (!unlimitedMode) setBalance(result.balance);
      refreshMissions();
    } catch (err: any) {
      setError(err.message || "Błąd podczas pasowania");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDouble = async () => {
    if (!gameState) return;

    try {
      const result = await api.blackjack.doubleWithMode(gameState.sessionId, unlimitedMode);
      setGameState(result);
      if (!unlimitedMode) setBalance(result.balance);
      refreshMissions();
    } catch (err: any) {
      setError(err.message || "Błąd podczas podwajania");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getResultMessage = () => {
    if (!gameState) return "";
    switch (gameState.result) {
      case "PlayerWin":
        return "WYGRANA!";
      case "Blackjack":
        return "BLACKJACK!";
      case "DealerWin":
        return "PRZEGRANA";
      case "Push":
        return "REMIS";
      default:
        return "";
    }
  };

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
          <button className="back-btn" onClick={() => navigate("/home")}>
            <i className="fas fa-arrow-left"></i>
            <span>POWRÓT</span>
          </button>

          <h1 className="slots-title">
            <span className="title-word">BLACK</span>
            <span className="title-word">JACK</span>
          </h1>

        <div className="header-right-cluster">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DemoToggle checked={unlimitedMode} onChange={setUnlimitedMode} />
            <div className="balance-display">
              <i className="fas fa-coins"></i>
              <span>{balance.toLocaleString()} PLN</span>
            </div>
          </div>
        </div>

        </div>

        {/* STӣ DO GRY */}
        <div className="sp-poker-table-wrapper">
          <div className="sp-poker-table-felt">
            {/* --- SEKCJA DEALERA (GORA) --- */}
            <div className="sp-dealer-section">
              {gameState ? (
                <>
                  <div className="sp-dealer-label">Karty Krupiera</div>
                  <div className="sp-dealer-hand-wrapper">
                    {gameState.dealerHand.map((card, idx) => (
                      <GameCard
                        key={`d-${idx}`}
                        card={card}
                        size="small"
                        hidden={!isGameFinished && idx === 1}
                      />
                    ))}
                  </div>
                  <div
                    className={`sp-rank-badge sp-dealer-rank-badge ${
                      isGameFinished ? "sp-active" : ""
                    }`}
                  >
                    {isGameFinished ? gameState.dealerScore : "?"}
                  </div>
                </>
              ) : (
                <div className="sp-dealer-label" style={{ opacity: 0 }}>
                  Oczekiwanie...
                </div>
              )}
            </div>

            {/* --- INFO SRODEK --- */}
            <div className="sp-table-center-info">
              {error ? (
                <div className="sp-game-message sp-error">{error}</div>
              ) : (
                <>
                  {!gameState && (
                    <div className="sp-game-message sp-hint">
                      Rozdaj karty, aby zagrac
                    </div>
                  )}
                  {gameState && !isGameFinished && (
                    <div className="sp-game-message sp-hint">
                      Stawka: {gameState.bet} PLN
                    </div>
                  )}
                  {gameState && isGameFinished && (
                    <div
                      className={`sp-result-text ${hasWon ? "sp-win" : "sp-lose"}`}
                    >
                      {getResultMessage()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* --- SEKCJA GRACZA (DOL) --- */}
            <div className="sp-player-section">
              {gameState && (
                <div className="sp-rank-badge sp-player-rank-badge">
                  {gameState.playerScore}
                </div>
              )}

              <div className="sp-hand-display">
                {gameState ? (
                  gameState.playerHand.map((card, idx) => (
                    <GameCard key={`p-${idx}`} card={card} size="medium" />
                  ))
                ) : (
                  [1, 2].map((i) => <div key={i} className="sp-card-slot"></div>)
                )}
              </div>
            </div>

            {/* --- PANEL STEROWANIA --- */}
            <div className="sp-controls-bar">
              {!gameState || isGameFinished ? (
                <>
                  <div className="sp-bet-control-group">
                    <button
                      className="sp-bet-btn-small"
                      onClick={() => setBet(Math.max(10, bet - 10))}
                    >
                      -
                    </button>
                    <div className="sp-bet-info">
                      <span className="sp-bet-label">STAWKA</span>
                      <span className="sp-bet-amount">{bet}</span>
                    </div>
                    <button
                      className="sp-bet-btn-small"
                      onClick={() => setBet(bet + 10)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="sp-main-btn sp-btn-deal"
                    onClick={startNewGame}
                    disabled={isDealing}
                  >
                    {isDealing ? "ROZDAWANIE..." : "ROZDAJ KARTY"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="sp-main-btn sp-btn-action sp-btn-hit"
                    onClick={handleHit}
                    disabled={!gameState.canHit}
                  >
                    <i className="fas fa-plus"></i>
                    DOBIERZ
                  </button>

                  <button
                    className="sp-main-btn sp-btn-action sp-btn-stand"
                    onClick={handleStand}
                    disabled={!gameState.canStand}
                  >
                    <i className="fas fa-hand-paper"></i>
                    PASUJ
                  </button>

                  <button
                    className="sp-main-btn sp-btn-action sp-btn-double"
                    onClick={handleDouble}
                    disabled={!gameState.canDouble}
                  >
                    <i className="fas fa-times"></i>
                    PODWÓJ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`leaderboard-drawer ${leaderboardOpen ? "open" : "closed"}`}>
        <div className="leaderboard-panel">
          <Leaderboard gameId={2} title="🏆 TOP WINS" className="leaderboard-widget" />
        </div>
        <button
          className="leaderboard-toggle"
          onClick={() => setLeaderboardOpen((prev) => !prev)}
          aria-expanded={leaderboardOpen}
          title={leaderboardOpen ? "Schowaj ranking" : "Pokaż ranking"}
        >
          <i className="fas fa-trophy"></i>
          <span>TOP</span>
        </button>
      </div>

      {/* PRZYCISK POMOCY */}
      <GameHelpModal content={BLACKJACK_HELP} position="floating" />
    </div>
  );
};

export default BlackjackPage;
