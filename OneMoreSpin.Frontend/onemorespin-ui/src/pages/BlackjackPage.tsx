import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { refreshMissions } from "../events";
import { fireConfetti } from "../utils/confetti";
import Leaderboard from "../components/Leaderboard";
import "../styles/BlackjackPage.css";

type BlackjackCard = {
  rank: string;
  suit: string;
  value: number;
};

type GameState = {
  sessionId: number;
  playerHand: BlackjackCard[];
  dealerHand: BlackjackCard[];
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

const BlackjackPage: React.FC = () => {
  const navigate = useNavigate();
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [error, setError] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isResultFadingOut, setIsResultFadingOut] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);

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

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0) {
      setBet(value);
    }
  };

  const adjustBet = (amount: number) => {
    const newBet = bet + amount;
    if (newBet >= 0 && newBet <= balance) {
      setBet(newBet);
    }
  };

  const startNewGame = async () => {
    if (bet <= 0) {
      setError("Wpisz kwotę większą niż 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (bet > balance) {
      setError("Niewystarczający balans");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsDealing(true);
    setError("");
    setShowResult(false);
    setGameState(null);

    try {
      const result = await api.blackjack.start(bet);
      
      setTimeout(() => {
        setGameState(result);
        setBalance(result.balance);
        setIsDealing(false);
        refreshMissions();

        if (result.gameFinished) {
          showGameResult(result);
        }
      }, 800);
    } catch (err: any) {
      setIsDealing(false);
      setError(err.message || "Błąd podczas rozpoczynania gry");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleHit = async () => {
    if (!gameState) return;

    try {
      const result = await api.blackjack.hit(gameState.sessionId);
      setGameState(result);
      setBalance(result.balance);

      if (result.gameFinished) {
        showGameResult(result);
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
      const result = await api.blackjack.stand(gameState.sessionId);
      setGameState(result);
      setBalance(result.balance);
      showGameResult(result);
      refreshMissions();
    } catch (err: any) {
      setError(err.message || "Błąd podczas pasowania");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDouble = async () => {
    if (!gameState) return;

    try {
      const result = await api.blackjack.double(gameState.sessionId);
      setGameState(result);
      setBalance(result.balance);
      showGameResult(result);
      refreshMissions();
    } catch (err: any) {
      setError(err.message || "Błąd podczas podwajania");
      setTimeout(() => setError(""), 3000);
    }
  };

  const showGameResult = (result: GameState) => {
    const showDelay = 500;
    const displayDuration = 3000;
    const fadeOutDuration = 500;

    setTimeout(() => {
      setShowResult(true);
      setIsResultFadingOut(false);
      
      // Fire confetti synchronized with banner appearance
      if (result.result === "PlayerWin" || result.result === "Blackjack") {
        fireConfetti(displayDuration + fadeOutDuration);
      }
    }, showDelay);

    setTimeout(() => {
      setIsResultFadingOut(true);
    }, showDelay + displayDuration);

    setTimeout(() => {
      setShowResult(false);
      setIsResultFadingOut(false);
    }, showDelay + displayDuration + fadeOutDuration);
  };

  const getCardSymbol = (suit: string) => {
    switch (suit) {
      case "Hearts":
        return "♥";
      case "Diamonds":
        return "♦";
      case "Clubs":
        return "♣";
      case "Spades":
        return "♠";
      default:
        return "";
    }
  };

  const getCardColor = (suit: string) => {
    return suit === "Hearts" || suit === "Diamonds" ? "red" : "black";
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
    <div className="blackjack-page">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <header className="blackjack-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <i className="fas fa-arrow-left"></i>
          <span>POWRÓT</span>
        </button>

        <h1 className="blackjack-title">
          <span className="title-word">BLACK</span>
          <span className="title-word">JACK</span>
        </h1>

        <div className="header-right-cluster">
          <div className="balance-display">
            <i className="fas fa-coins"></i>
            <span>{balance.toLocaleString()} PLN</span>
          </div>
        </div>
      </header>

      <main className={`blackjack-main leaderboard-host ${leaderboardOpen ? "leaderboard-visible" : ""}`}>
        <div className="blackjack-container">
          <div className="left-panel">
            <div className="bet-section">
              <label className="bet-label">STAWKA</label>

              <div className="bet-row">
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-100)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  -100
                </button>
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-50)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  -50
                </button>
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-10)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  -10
                </button>
              </div>

              <input
                type="number"
                value={bet}
                onChange={handleBetChange}
                className="bet-input"
                min="0"
                max={balance}
                disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                placeholder="Wpisz kwotę"
              />

              <div className="bet-row">
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(10)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  +10
                </button>
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(50)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  +50
                </button>
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(100)}
                  disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
                >
                  +100
                </button>
              </div>

              <button
                className="max-bet-btn"
                onClick={() => setBet(balance)}
                disabled={isDealing || (gameState !== null && !gameState.gameFinished)}
              >
                MAX BET
              </button>

              {!gameState && (
                <button
                  className="deal-btn"
                  onClick={startNewGame}
                  disabled={isDealing}
                >
                  <i className="fas fa-play"></i>
                  <span>{isDealing ? "ROZDAWANIE..." : "ROZDAJ"}</span>
                </button>
              )}

              {gameState && gameState.gameFinished && (
                <button className="new-game-btn" onClick={startNewGame}>
                  <i className="fas fa-redo"></i>
                  <span>NOWA GRA</span>
                </button>
              )}
            </div>

            {gameState && !gameState.gameFinished && (
              <div className="game-info">
                <div className="info-label">AKTUALNA STAWKA</div>
                <div className="info-value">{gameState.bet} PLN</div>
              </div>
            )}
          </div>

          <div className="game-area game-table">
            <div className="dealer-section">
              <div className="section-label">
                <span>KRUPIER</span>
                {gameState && (
                  <span className="score">
                    {gameState.gameFinished ? gameState.dealerScore : '?'}
                  </span>
                )}
              </div>
              <div className="card-hand">
                {gameState?.dealerHand.map((card, index) => (
                  <div
                    key={index}
                    className={`playing-card ${isDealing ? "dealing" : ""}`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="card-content">
                      <div className={`card-rank ${getCardColor(card.suit)}`}>
                        {card.rank}
                      </div>
                      <div className={`card-suit ${getCardColor(card.suit)}`}>
                        {getCardSymbol(card.suit)}
                      </div>
                    </div>
                  </div>
                ))}
                {gameState && !gameState.gameFinished && (
                  <div className="playing-card card-back">
                    <div className="card-pattern"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="table-center">
              <div className="chip-stack">
                {gameState && (
                  <div className="bet-amount">{gameState.bet} PLN</div>
                )}
              </div>
            </div>

            <div className="player-section">
              <div className="section-label">
                <span>GRACZ</span>
                {gameState && <span className="score">{gameState.playerScore}</span>}
              </div>
              <div className="card-hand">
                {gameState?.playerHand.map((card, index) => (
                  <div
                    key={index}
                    className={`playing-card ${isDealing ? "dealing" : ""}`}
                    style={{ animationDelay: `${(index + 2) * 0.15}s` }}
                  >
                    <div className="card-content">
                      <div className={`card-rank ${getCardColor(card.suit)}`}>
                        {card.rank}
                      </div>
                      <div className={`card-suit ${getCardColor(card.suit)}`}>
                        {getCardSymbol(card.suit)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="action-buttons">
              {gameState && !gameState.gameFinished && (
                <>
                  <button
                    className="action-btn hit-btn"
                    onClick={handleHit}
                    disabled={!gameState.canHit}
                  >
                    <i className="fas fa-plus"></i>
                    <span>DOBIERZ</span>
                  </button>

                  <button
                    className="action-btn stand-btn"
                    onClick={handleStand}
                    disabled={!gameState.canStand}
                  >
                    <i className="fas fa-hand-paper"></i>
                    <span>PASUJ</span>
                  </button>

                  <button
                    className="action-btn double-btn"
                    onClick={handleDouble}
                    disabled={!gameState.canDouble}
                  >
                    <i className="fas fa-times"></i>
                    <span>PODWÓJ</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`leaderboard-drawer ${leaderboardOpen ? "open" : "closed"}`}>
          <button
            className="leaderboard-toggle"
            onClick={() => setLeaderboardOpen((prev) => !prev)}
            aria-expanded={leaderboardOpen}
          >
            <i className={`fas ${leaderboardOpen ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            <span>{leaderboardOpen ? "Schowaj" : "Top wins"}</span>
          </button>
          <div className="leaderboard-panel">
            <Leaderboard gameId={2} title="TOP WINS" className="leaderboard-widget" />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {showResult && gameState && (gameState.result === "PlayerWin" || gameState.result === "Blackjack") && (
          <div className={`result-overlay ${isResultFadingOut ? "fade-out" : ""}`}>
            <div className="result-banner win">
              <h2 className="result-text">{getResultMessage()}</h2>
              <p className="result-amount">
                +{(gameState.payout - gameState.bet).toLocaleString()} PLN
              </p>
            </div>
          </div>
        )}

        {showResult && gameState && gameState.result === "Push" && (
          <div className={`result-overlay ${isResultFadingOut ? "fade-out" : ""}`}>
            <div className="result-banner push">
              <h2 className="result-text">{getResultMessage()}</h2>
              <p className="result-amount">
                {gameState.bet.toLocaleString()} PLN
              </p>
            </div>
          </div>
        )}

        {showResult && gameState && gameState.result === "DealerWin" && (
          <div className={`result-overlay ${isResultFadingOut ? "fade-out" : ""}`}>
            <div className="result-banner lose">
              <h2 className="result-text">{getResultMessage()}</h2>
              <p className="result-amount">
                -{gameState.bet.toLocaleString()} PLN
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlackjackPage;
