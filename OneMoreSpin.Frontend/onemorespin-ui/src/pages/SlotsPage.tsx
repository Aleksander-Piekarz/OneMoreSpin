import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/SlotsPage.css";

import diamondImg from "../assets/img/slots/diamond.png";
import sevenImg from "../assets/img/slots/seven.png";
import bellImg from "../assets/img/slots/bell.png";
import AImg from "../assets/img/slots/A.png";
import KImg from "../assets/img/slots/K.png";
import QImg from "../assets/img/slots/Q.png";
import JImg from "../assets/img/slots/J.png";

import leverSound from "../assets/sounds/lever-pull.mp3";
import winSound from "../assets/sounds/win.mp3";
import loseSound from "../assets/sounds/lose.mp3";

const SlotsPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [error, setError] = useState<string>("");
  const [winningLines, setWinningLines] = useState<number[][]>([]);

  const symbolMap: { [key: string]: string } = {
    "J": JImg, 
    "Q": QImg, 
    "K": KImg, 
    "A": AImg, 
    "🔔": bellImg, 
    "💎": diamondImg, 
    "7️⃣": sevenImg
  };

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

  // Definicja linii wypłat - musi być identyczna jak w backendzie
  const paylines: number[][][] = [
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // Środkowa
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // Górna
    [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // Dolna
    [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // V odwrócone
    [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // V normalne
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
      // Podświetl tylko zwycięskie symbole na linii
      for (let i = 0; i < detail.count; i++) {
        const [row, col] = line[i];
        winningCells.add(`${row},${col}`);
      }
    });

    return Array.from(winningCells).map(cell => cell.split(',').map(Number));
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    new Audio(leverSound).play();

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

    setIsSpinning(true);
    setError("");
    setShowWin(false);
    setShowConfetti(false);
    setWinningLines([]);

    const spinDuration = 2000;
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
      const result = await api.slots.spin(bet);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        setGrid(result.grid);
        setBalance(result.balance);
        setIsSpinning(false);

        if (result.isWin && result.winDetails?.length > 0) {
          new Audio(winSound).play();
          const lines = detectWinningLines(result.winDetails);
          setWinningLines(lines);
          setWinAmount(result.win);
          
          setTimeout(() => {
            setShowWin(true);
            setShowConfetti(true);
            setIsFadingOut(false);
          }, 1500);
          
          setTimeout(() => {
            setIsFadingOut(true);
          }, 5200);
          
          setTimeout(() => {
            setShowWin(false);
            setShowConfetti(false);
            setWinningLines([]);
            setIsFadingOut(false);
          }, 6000);
        } else {
          new Audio(loseSound).play();
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

      <header className="slots-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <i className="fas fa-arrow-left"></i>
          <span>POWRÓT</span>
        </button>

        <h1 className="slots-title">
          <span className="title-word">SLOT</span>
          <span className="title-word">MACHINE</span>
        </h1>

        <div className="balance-display">
          <i className="fas fa-coins"></i>
          <span>{balance.toLocaleString()} PLN</span>
        </div>
      </header>

      <main className="slots-main">
        <div className="slots-container">
          <div className="left-panel">
            <div className="bet-section">
              <label className="bet-label">STAWKA</label>
              
              <div className="bet-row">
                <button 
                  className="bet-quick-btn small" 
                  onClick={() => adjustBet(-100)}
                  disabled={isSpinning}
                >
                  -100
                </button>
                <button 
                  className="bet-quick-btn small" 
                  onClick={() => adjustBet(-50)}
                  disabled={isSpinning}
                >
                  -50
                </button>
                <button 
                  className="bet-quick-btn small" 
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
                disabled={isSpinning}
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

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {showWin && (
          <div className={`win-overlay ${isFadingOut ? 'fade-out' : ''}`}>
            <div className="win-banner">
              <h2 className="win-text">WYGRANA!</h2>
              <p className="win-amount">+{winAmount.toLocaleString()} PLN</p>
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
