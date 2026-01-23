import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../api";
import { refreshMissions } from "../events";
import { fireConfetti } from "../utils/confetti";
import Leaderboard from "../components/Leaderboard";
import { GameHelpModal, SLOTS_HELP } from "../components/GameHelpModal";
import "../styles/SlotsPage.css";
import "../styles/GameHeader.css";
import DemoToggle from "../components/DemoToggle";

import lemonImg from "../assets/img/slots/lemon.png";
import cherriesImg from "../assets/img/slots/cherries.png";
import grapesImg from "../assets/img/slots/grapes.png";
import bellImg from "../assets/img/slots/bell.png";
import cloverImg from "../assets/img/slots/clover.png";
import sevenImg from "../assets/img/slots/seven.png";
import diamondImg from "../assets/img/slots/diamond.png";

import leverSoundDefault from "../assets/sounds/lever-pull-default.mp3";
import winSoundDefault from "../assets/sounds/win-default.mp3";
import loseSoundDefault from "../assets/sounds/lose-default.mp3";

const SlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
  ]);
  const [showWin, setShowWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winMultiplier, setWinMultiplier] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [error, setError] = useState<string>("");
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(Infinity);
  const [remainingSpins, setRemainingSpins] = useState<number>(Infinity);
  const [isShowingWin, setIsShowingWin] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [unlimitedMode, setUnlimitedMode] = useState(false);


  const leverAudioRef = React.useRef<HTMLAudioElement>(new Audio(leverSoundDefault));
  const winAudioRef = React.useRef<HTMLAudioElement>(new Audio(winSoundDefault));
  const loseAudioRef = React.useRef<HTMLAudioElement>(new Audio(loseSoundDefault));

  const symbolMap: { [key: string]: string } = {
    "LEMON": lemonImg,
    "CHERRIES": cherriesImg,
    "GRAPES": grapesImg,
    "BELL": bellImg,
    "CLOVER": cloverImg,
    "SEVEN": sevenImg,
    "DIAMOND": diamondImg
  };

  const playSound = (type: 'lever' | 'win' | 'lose') => {
    const audioRef = type === 'lever' ? leverAudioRef : type === 'win' ? winAudioRef : loseAudioRef;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Error playing sound:', err));
    }
  };

  useEffect(() => {
    const preloadAudio = () => {
      leverAudioRef.current.preload = 'auto';
      winAudioRef.current.preload = 'auto';
      loseAudioRef.current.preload = 'auto';

      leverAudioRef.current.load();
      winAudioRef.current.load();
      loseAudioRef.current.load();
    };

    preloadAudio();
  }, []);

  useEffect(() => {
    const preloadImages = () => {
      Object.values(symbolMap).forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();
  }, []);

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
    if (autoPlay && !isSpinning && !isShowingWin && bet > 0 && bet <= balance && remainingSpins > 0) {
      const timer = setTimeout(() => {
        handleSpin();
        if (remainingSpins !== Infinity) {
          setRemainingSpins(prev => prev - 1);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (autoPlay && remainingSpins === 0) {
      setAutoPlay(false);
      setRemainingSpins(autoSpinCount);
    }
  }, [autoPlay, isSpinning, isShowingWin, balance, bet, remainingSpins]);

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

  const toggleAutoPlay = () => {
    if (autoPlay) {
      setAutoPlay(false);
      setRemainingSpins(autoSpinCount);
    } else {
      setAutoPlay(true);
      setRemainingSpins(autoSpinCount);
    }
  };

  const handleAutoSpinCountChange = (count: number) => {
    setAutoSpinCount(count);
    if (!autoPlay) {
      setRemainingSpins(count);
    }
  };

  const paylines: number[][][] = [
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
    [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]],
    [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]],
    [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]],
    [[1, 0], [2, 1], [2, 2], [2, 3], [1, 4]],
    [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]],
    [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]],
    [[0, 0], [1, 1], [1, 2], [1, 3], [2, 4]]
  ];

  const detectWinningLines = (winDetails: { paylineIndex: number, count: number }[]) => {
    const winningCells = new Set<string>();

    winDetails.forEach(detail => {
      const line = paylines[detail.paylineIndex];
      for (let i = 0; i < detail.count; i++) {
        const [row, col] = line[i];
        winningCells.add(`${row},${col}`);
      }
    });

    return Array.from(winningCells).map(cell => cell.split(',').map(Number));
  };

  const handleSpin = async () => {
    if (isSpinning || isShowingWin) return;

    playSound('lever');

    if (bet <= 0) {
      setError(t('games.slots.invalidBet'));
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (bet > balance) {
      setError(t('games.slots.insufficientBalance'));
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsSpinning(true);
    setError("");
    setShowWin(false);
    setShowConfetti(false);
    setWinningLines([]);

    const spinDuration = 1000;
    const spinInterval = setInterval(() => {
      const randomGrid = Array(3).fill(null).map(() =>
        Array(5).fill(null).map(() => {
          const symbols = Object.keys(symbolMap);
          return symbols[Math.floor(Math.random() * symbols.length)];
        })
      );
      setGrid(randomGrid);
    }, 100);

    try {
      const result = await api.slots.spin(bet, unlimitedMode);

      setTimeout(() => {
        clearInterval(spinInterval);
        setGrid(result.grid);
        setBalance(result.balance);
        setIsSpinning(false);
        refreshMissions();

        if (result.isWin && result.winDetails?.length > 0) {
          playSound('win');
          setIsShowingWin(true);
          const lines = detectWinningLines(result.winDetails);
          setWinningLines(lines);
          setWinAmount(result.win);
          const totalMultiplier = result.winDetails.reduce((sum: number, detail: any) => sum + (detail.Multiplier || detail.multiplier || 0), 0);
          setWinMultiplier(totalMultiplier);

          const showDelay = 300;
          const displayDuration = 2500;
          const fadeOutDuration = 400;

          setTimeout(() => {
            setShowWin(true);
            setShowConfetti(true);
            setIsFadingOut(false);
            fireConfetti(displayDuration + fadeOutDuration);
          }, showDelay);

          setTimeout(() => {
            setIsFadingOut(true);
          }, showDelay + displayDuration);

          setTimeout(() => {
            setShowWin(false);
            setShowConfetti(false);
            setWinningLines([]);
            setIsFadingOut(false);
            setIsShowingWin(false);
          }, showDelay + displayDuration + fadeOutDuration);
        } else {
          playSound('lose');
        }
      }, spinDuration);

    } catch (err: any) {
      clearInterval(spinInterval);
      setIsSpinning(false);
      setError(err.message || "Błąd podczas gry");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="slots-page">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <header className="game-header">
        <div className="game-header-left">
          <button className="game-back-btn" onClick={() => navigate("/home")}>
            <i className="fas fa-arrow-left"></i>
            <span>{t('common.back')}</span>
          </button>
        </div>
        <div className="game-header-center">
          <div className="game-title">
            <span className="game-title-word">SLOT</span>
            <span className="game-title-word">MACHINE</span>
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

      <main className={`slots-main leaderboard-host ${leaderboardOpen ? 'leaderboard-visible' : ''}`}>
        <div className="slots-container">
          <div className="left-panel">
            <div className="bet-section">
              <label className="bet-label">STAWKA</label>

              <div className="bet-row">
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-100)}
                  disabled={isSpinning}
                >
                  -100
                </button>
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-50)}
                  disabled={isSpinning}
                >
                  -50
                </button>
                <button
                  className="bet-quick-btn small negative"
                  onClick={() => adjustBet(-10)}
                  disabled={isSpinning}
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
                disabled={isSpinning}
                placeholder="Wpisz kwotę"
              />

              <div className="bet-row">
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(10)}
                  disabled={isSpinning}
                >
                  +10
                </button>
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(50)}
                  disabled={isSpinning}
                >
                  +50
                </button>
                <button
                  className="bet-quick-btn small"
                  onClick={() => adjustBet(100)}
                  disabled={isSpinning}
                >
                  +100
                </button>
              </div>

              <button
                className="max-bet-btn"
                onClick={() => setBet(balance)}
                disabled={isSpinning}
              >
                MAX BET
              </button>

              <div className="auto-play-section">
                <label className="auto-play-label">AUTO SPIN</label>

                <div className="auto-spin-options">
                  <button
                    className={`auto-spin-option ${autoSpinCount === 5 ? 'selected' : ''}`}
                    onClick={() => handleAutoSpinCountChange(5)}
                    disabled={autoPlay}
                  >
                    5
                  </button>
                  <button
                    className={`auto-spin-option ${autoSpinCount === 10 ? 'selected' : ''}`}
                    onClick={() => handleAutoSpinCountChange(10)}
                    disabled={autoPlay}
                  >
                    10
                  </button>
                  <button
                    className={`auto-spin-option ${autoSpinCount === 20 ? 'selected' : ''}`}
                    onClick={() => handleAutoSpinCountChange(20)}
                    disabled={autoPlay}
                  >
                    20
                  </button>
                  <button
                    className={`auto-spin-option ${autoSpinCount === 50 ? 'selected' : ''}`}
                    onClick={() => handleAutoSpinCountChange(50)}
                    disabled={autoPlay}
                  >
                    50
                  </button>
                  <button
                    className={`auto-spin-option ${autoSpinCount === Infinity ? 'selected' : ''}`}
                    onClick={() => handleAutoSpinCountChange(Infinity)}
                    disabled={autoPlay}
                  >
                    <i className="fas fa-infinity"></i>
                  </button>
                </div>

                <button
                  className={`auto-play-btn ${autoPlay ? 'active' : ''}`}
                  onClick={toggleAutoPlay}
                >
                  <i className={`fas ${autoPlay ? 'fa-stop' : 'fa-play'}`}></i>
                  <span>
                    {autoPlay
                      ? `STOP (${remainingSpins === Infinity ? '∞' : remainingSpins})`
                      : 'START AUTO'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="slot-machine">
            <div className="machine-top">
              <div className="machine-light light-1"></div>
              <div className="machine-light light-2"></div>
              <div className="machine-light light-3"></div>
            </div>

            <div className="slot-grid">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className={`slot-row ${isSpinning ? 'spinning' : ''}`}>
                  {row.map((symbol, colIndex) => {
                    const isWinningCell = winningLines.some(
                      ([r, c]) => r === rowIndex && c === colIndex
                    );
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`slot-cell ${isSpinning ? 'spinning-cell' : ''} ${isWinningCell ? 'winning' : ''}`}
                        style={{ animationDelay: `${colIndex * 0.1}s` }}
                      >
                        {symbol && symbolMap[symbol] && (
                          <img
                            src={symbolMap[symbol]}
                            alt={symbol}
                            className="slot-symbol"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="machine-bottom"></div>
          </div>

          <div className="right-panel">
            <div className="lever-container">
              <button
                className={`lever-btn ${isSpinning ? 'pulling' : ''}`}
                onClick={handleSpin}
                disabled={isSpinning || autoPlay}
              >
                <div className="lever-handle">
                  <div className="lever-ball">
                    <div className="lever-ball-shine"></div>
                  </div>
                  <div className="lever-stick"></div>
                </div>
                <div className="lever-base">
                  <div className="lever-base-top"></div>
                  <div className="lever-base-body"></div>
                </div>
              </button>
              <div className="lever-text">{isSpinning ? 'SPINNING...' : 'POCIĄGNIJ'}</div>
            </div>
          </div>
        </div>

        <div className={`leaderboard-drawer ${leaderboardOpen ? 'open' : 'closed'}`}>
          <div className="leaderboard-panel">
            <Leaderboard gameId={3} title="🏆 TOP WINS" className="leaderboard-widget" />
          </div>
          <button
            className="leaderboard-toggle"
            onClick={() => setLeaderboardOpen((prev) => !prev)}
            aria-expanded={leaderboardOpen}
            title={leaderboardOpen ? t('games.slots.hideLeaderboard') : t('games.slots.showLeaderboard')}
          >
            <span>TOP</span>
          </button>
        </div>

        <GameHelpModal content={SLOTS_HELP} position="floating" />

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {showWin && (
          <div className={`win-overlay ${isFadingOut ? 'fade-out' : ''}`}>
            <div className="win-banner">
              <h2 className="win-text">{t('games.slots.win')}</h2>
              <p className="win-amount">+{winAmount.toLocaleString()} PLN</p>
              <p className="win-multiplier">Mnożnik: {winMultiplier.toFixed(1)}x</p>
            </div>
          </div>
        )}

        {showConfetti && (
          <div className={`confetti-container ${isFadingOut ? 'fade-out' : ''}`}>
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            ))}
          </div>
        )}


      </main>
    </div>
  );
};

export default SlotsPage;
