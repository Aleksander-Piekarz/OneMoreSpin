import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../api";
import { refreshMissions } from "../events";
import { fireConfetti } from "../utils/confetti";
import Leaderboard from "../components/Leaderboard";
import DemoToggle from "../components/DemoToggle";
import { GameCard, type ThemeType } from "../components/GameCard";
import "../styles/MultiplayerBlackjackPage.css";
import "../styles/GameHeader.css";

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

const BlackjackPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(0);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [error, setError] = useState<string>("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const isGameFinished = gameState?.gameFinished ?? false;
  const hasWon = gameState?.result === "PlayerWin" || gameState?.result === "Blackjack";
  const currentTheme: ThemeType = 'beginner';
  const showDealerSecondCard = gameState && isGameFinished;

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
      let message = "";
      switch (gameState.result) {
        case "PlayerWin":
          message = t('games.blackjack.win');
          break;
        case "Blackjack":
          message = t('games.blackjack.blackjack');
          break;
        case "DealerWin":
          message = t('games.blackjack.lose');
          break;
        case "Push":
          message = t('games.blackjack.push');
          break;
      }

      if (message) {
        setResultMessage(message);
        setShowResultOverlay(true);

        if (hasWon) {
          fireConfetti();
        }

        setTimeout(() => {
          setShowResultOverlay(false);
        }, 3000);
      }
    }
  }, [gameState, isDealing, isGameFinished]);

  const startNewGame = async () => {
    if (bet <= 0) {
      setError(t('games.blackjack.invalidBet'));
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!unlimitedMode && bet > balance) {
      setError(t('games.blackjack.insufficientBalance'));
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
      setError(err.message || t('games.blackjack.gameError'));
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
      setError(err.message || t('games.blackjack.hitError'));
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
      setError(err.message || t('games.blackjack.standError'));
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
      setError(err.message || t('games.blackjack.doubleError'));
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="bj-game-page leaderboard-host">
      <header className="game-header">
        <div className="game-header-left">
          <button onClick={() => navigate(-1)} className="game-back-btn">
            <i className="fas fa-arrow-left"></i>
            <span>{t('common.back')}</span>
          </button>
        </div>
        <div className="game-header-center">
          <div className="game-title">
            <span className="game-title-word">BLACKJACK</span>
          </div>
        </div>
        <div className="game-header-right">
          <DemoToggle checked={unlimitedMode} onChange={setUnlimitedMode} />
          <div className="game-balance-display">
            <i className="fas fa-coins"></i>
            <span>{balance.toLocaleString()} PLN</span>
          </div>
        </div>
      </header>

      <main className="bj-game-main">
        <div className="bj-animated-bg">
          <div className="bj-floating-shape bj-shape-1"></div>
          <div className="bj-floating-shape bj-shape-2"></div>
          <div className="bj-floating-shape bj-shape-3"></div>
        </div>

        <div className="bj-table-container">
          <div className={`bj-table bj-table-${currentTheme}`}>
            <div className="bj-dealer-area">
              <div className="bj-dealer-label">Dealer</div>
              <div className="bj-dealer-cards">
                {gameState ? (
                  gameState.dealerHand.map((card, i) => (
                    <GameCard
                      key={i}
                      card={card}
                      hidden={i === 1 && !showDealerSecondCard}
                      theme={currentTheme}
                    />
                  ))
                ) : (
                  <>
                    <GameCard theme={currentTheme} hidden />
                    <GameCard theme={currentTheme} hidden />
                  </>
                )}
              </div>
              {gameState && gameState.dealerHand.length > 0 && (
                <div className="bj-dealer-score">
                  {gameState.dealerScore > 21 ? "BUST!" : gameState.dealerScore}
                </div>
              )}
            </div>
          </div>

          <div className="bj-players-container">
            <div className="bj-player-seat bj-is-me">
              <div className="bj-player-cards">
                {gameState && gameState.playerHand.length > 0 ? (
                  gameState.playerHand.map((card, idx) => (
                    <GameCard key={idx} card={card} theme={currentTheme} size="large" />
                  ))
                ) : (
                  <div className="bj-empty-hand">{t('games.blackjack.waiting')}</div>
                )}
              </div>

              <div className="bj-player-info">
                {gameState && gameState.playerHand.length > 0 && (
                  <span className="bj-player-score">
                    {gameState.playerScore > 21 ? "BUST" : gameState.playerScore}
                  </span>
                )}
                {gameState && gameState.bet > 0 && (
                  <span className="bj-player-bet">${gameState.bet}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bj-controls-bar">
        {error && (
          <div style={{ color: '#ef4444', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {!gameState || isGameFinished ? (
          <>
            <div className="bj-bet-control">
              <span className="bj-bet-label">{t('common.bet')}:</span>
              <button 
                onClick={() => setBet(Math.max(10, bet - 10))} 
                className="bj-bet-btn"
                disabled={isDealing}
              >
                -
              </button>
              <input
                type="number"
                className="bj-bet-input"
                value={bet}
                onChange={(e) => setBet(Math.max(10, parseInt(e.target.value) || 10))}
                min={10}
                disabled={isDealing}
              />
              <button 
                onClick={() => setBet(bet + 10)} 
                className="bj-bet-btn"
                disabled={isDealing}
              >
                +
              </button>
            </div>

            <button
              onClick={startNewGame}
              disabled={isDealing}
              className="bj-game-btn bj-btn-start"
            >
              {isDealing ? t('games.blackjack.dealing') : t('games.blackjack.dealCards')}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleHit}
              disabled={!gameState.canHit}
              className="bj-game-btn bj-btn-hit"
            >
              <i className="fas fa-plus"></i> {t('games.blackjack.hit')}
            </button>

            <button
              onClick={handleStand}
              disabled={!gameState.canStand}
              className="bj-game-btn bj-btn-stand"
            >
              <i className="fas fa-hand-paper"></i> {t('games.blackjack.stand')}
            </button>

            <button
              onClick={handleDouble}
              disabled={!gameState.canDouble}
              className="bj-game-btn bj-btn-double"
            >
              <i className="fas fa-times"></i> {t('games.blackjack.double')}
            </button>
          </>
        )}
      </div>

      <div className={`leaderboard-drawer ${leaderboardOpen ? 'open' : 'closed'}`}>
        <div className="leaderboard-panel">
          <Leaderboard gameId={2} title="🏆 TOP WINS" className="leaderboard-widget" />
        </div>
        <button
          className="leaderboard-toggle"
          onClick={() => setLeaderboardOpen(prev => !prev)}
          aria-expanded={leaderboardOpen}
          title={leaderboardOpen ? t('games.blackjack.hideLeaderboard') : t('games.blackjack.showLeaderboard')}
        >
          <span>TOP</span>
        </button>
      </div>

      {showResultOverlay && (
        <div className="sp-result-overlay">
          <div className={`sp-result-text ${hasWon ? 'sp-win' : 'sp-lose'}`}>
            {resultMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlackjackPage;
