import { useState, useEffect, useRef } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';
import DemoToggle from '../components/DemoToggle';
import { refreshMissions } from "../events";
import Leaderboard from '../components/Leaderboard';
import "../styles/RoulettePage.css";
import "../styles/GameHeader.css";

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const CHIP_VALUES = [10, 50, 100, 500];

type BetType = 'NUMBER' | 'COLOR' | 'PARITY' | 'HALF';
type BetValue = number | 'RED' | 'BLACK' | 'EVEN' | 'ODD' | 'LOW' | 'HIGH';

interface Bet {
  type: BetType;
  value: BetValue;
  amount: number;
}


const Chip = ({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) => {
  const getColor = (val: number) => {
    if (val === 10) return 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.6)]';
    if (val === 50) return 'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.6)]';
    if (val === 100) return 'bg-green-600 border-green-400 shadow-[0_0_10px_rgba(22,163,74,0.6)]';
    return 'bg-black border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm shadow-lg transition-all duration-300
        ${getColor(value)}
        ${selected ? 'scale-110 -translate-y-2 ring-2 ring-white z-20' : 'hover:scale-105 hover:-translate-y-1 opacity-90 hover:opacity-100'}
        text-white
      `}
    >
      <div className="absolute inset-0 rounded-full border border-white/20 border-dashed animate-[spin_10s_linear_infinite]"></div>
      <span className="z-10 drop-shadow-md">{value}</span>
    </button>
  );
};

const RouletteWheel = ({ 
  rotation, 
  isSpinning, 
  numbers, 
  isRed 
}: { 
  rotation: number; 
  isSpinning: boolean; 
  numbers: number[]; 
  isRed: (n: number) => boolean; 
}) => {
  const center = 50;
  const radius = 48;
  const segmentAngle = 360 / 37;

  const getCoordinatesForAngle = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  return (
    <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] flex items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-lg"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full bg-black border-4 border-yellow-700 rounded-full shadow-2xl ring-4 ring-black"
        style={{ 
          transform: `rotate(${rotation}deg)`, 
          transition: isSpinning ? 'transform 8s cubic-bezier(0.1, 0, 0.1, 1)' : 'none' 
        }}
      >
        <circle cx="50" cy="50" r="49" fill="#0f172a" />
        
        {numbers.map((num, i) => {
          const startAngle = i * segmentAngle - segmentAngle / 2;
          const endAngle = i * segmentAngle + segmentAngle / 2;
          
          const p1 = getCoordinatesForAngle(startAngle, radius);
          const p2 = getCoordinatesForAngle(endAngle, radius);
          
          const d = `
            M ${center} ${center}
            L ${p1.x} ${p1.y}
            A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}
            Z
          `;
          
          const color = num === 0 ? '#16a34a' : isRed(num) ? '#b91c1c' : '#0f172a';
          
          const textAngle = i * segmentAngle;
          const textPos = getCoordinatesForAngle(textAngle, 40);

          return (
            <g key={num}>
              <path d={d} fill={color} stroke="#fbbf24" strokeWidth="0.1" />
              <text 
                x={textPos.x} 
                y={textPos.y} 
                fill="white" 
                fontSize="4" 
                fontWeight="bold" 
                textAnchor="middle" 
                dominantBaseline="middle"
                transform={`rotate(${textAngle}, ${textPos.x}, ${textPos.y})`}
              >
                {num}
              </text>
            </g>
          );
        })}
        
        <circle cx="50" cy="50" r="15" fill="#b45309" stroke="#78350f" strokeWidth="2" />
        <circle cx="50" cy="50" r="10" fill="#f59e0b" />
      </svg>

    </div>
  );
};


export default function RouletteGame() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  
  const [currentChip, setCurrentChip] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  
  const [showWin, setShowWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playTick = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  };

  useEffect(() => {
    if (isSpinning) {
      let startTime = Date.now();
      let timeoutId: any;
      const duration = 8000;
      
      const tick = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) return;
        
        playTick();
        
        const progress = elapsed / duration;
        const nextDelay = 50 + 800 * Math.pow(progress, 3);
        
        timeoutId = setTimeout(tick, nextDelay);
      };
      
      tick();
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSpinning]);

  useEffect(() => {
    api.auth.me().then((user: any) => {
        if(user && user.balance !== undefined) {
            setBalance(user.balance);
        }
    }).catch(err => console.error("Failed to fetch user info", err));
  }, []);

  const isRed = (num: number) => RED_NUMBERS.includes(num);

  const placeBet = (type: BetType, value: BetValue) => {
    if (isSpinning) return;
    if (!unlimitedMode && balance < currentChip) {
      return;
    }

    if (!unlimitedMode) setBalance(prev => prev - currentChip);
    
    setBets(prev => {
      const existingBetIndex = prev.findIndex(b => b.type === type && b.value === value);
      if (existingBetIndex >= 0) {
        return prev.map((bet, index) => 
          index === existingBetIndex 
            ? { ...bet, amount: bet.amount + currentChip } 
            : bet
        );
      }
      return [...prev, { type, value, amount: currentChip }];
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    const totalRefund = bets.reduce((acc, bet) => acc + bet.amount, 0);
    if (!unlimitedMode) setBalance(prev => prev + totalRefund);
    setBets([]);
  };

  const spinWheel = async () => {
    if (bets.length === 0) {
      return;
    }
    if (isSpinning) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsSpinning(true);
    setShowWin(false);
    setShowConfetti(false);

    try {
        const result = await api.roulette.spin({
            bets: bets.map(b => ({
                type: b.type,
                value: b.value.toString(),
                amount: b.amount
            }))
        }, unlimitedMode);

        const winningNumber = result.winNumber;

        const indexOnWheel = WHEEL_NUMBERS.indexOf(winningNumber);
        const segmentAngle = 360 / 37;
        
        const targetAngleOnWheel = indexOnWheel * segmentAngle;
        const targetRotationValue = (360 - targetAngleOnWheel) % 360;
        
        const currentMod = wheelRotation % 360;
        
        let rotationNeeded = targetRotationValue - currentMod;
        if (rotationNeeded < 0) {
            rotationNeeded += 360;
        }
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
        
        const extraSpins = 360 * 5;
        
        const finalRotation = wheelRotation + extraSpins + rotationNeeded + randomOffset;

        setWheelRotation(finalRotation);

        setTimeout(() => {
          resolveGame(result);
        }, 8000);
    } catch (error: any) {
        setIsSpinning(false);
        console.error(error.message || t('games.roulette.gameError'));
        api.auth.me().then((u: any) => setBalance(u.balance));
    }
  };

  const resolveGame = (result: any) => {
    setLastResult(result.winNumber);
    setHistory(prev => [result.winNumber, ...prev].slice(0, 10));
    setIsSpinning(false);
    
    const totalCurrentBets = bets.reduce((acc, bet) => acc + bet.amount, 0);
    
    if (!unlimitedMode) {
      if (result.balance >= totalCurrentBets) {
        setBalance(result.balance - totalCurrentBets);
    } else {
        setBalance(result.balance);
        setBets([]);
      }
    } else {
      setBets([]);
    }
    
    refreshMissions();
    
    if (result.winAmount > 0) {
        setWinAmount(result.winAmount);
        setShowWin(true);
        setShowConfetti(true);
        setIsFadingOut(false);
        
        setTimeout(() => {
            setIsFadingOut(true);
        }, 2500);
        
        setTimeout(() => {
            setShowWin(false);
            setShowConfetti(false);
            setIsFadingOut(false);
        }, 3000);
    }
  };


  const renderNumberCell = (num: number) => {
    const isRedNum = isRed(num);
    const colorClass = num === 0 
        ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[inset_0_0_15px_rgba(34,197,94,0.2)] hover:bg-green-500/40' 
        : isRedNum 
            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-500/40' 
            : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700';
    
    const betOnThis = bets.find(b => b.type === 'NUMBER' && b.value === num);

    return (
      <div 
        key={num}
        onClick={() => placeBet('NUMBER', num)}
        className={`
          relative flex items-center justify-center border h-10 cursor-pointer hover:brightness-125 transition-all font-black text-base
          ${colorClass}
        `}
      >
        <span className="drop-shadow-md">{num}</span>
        {betOnThis && (
          <div className="absolute z-10 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            {betOnThis.amount}
          </div>
        )}
      </div>
    );
  };

  const renderBetArea = (label: string, type: BetType, value: BetValue, colorClass: string) => {
     const betOnThis = bets.find(b => b.type === type && b.value === value);
     return (
        <div 
          onClick={() => placeBet(type, value)}
          className={`relative flex items-center justify-center h-9 border cursor-pointer hover:brightness-125 font-bold text-white transition-all uppercase text-xs tracking-wider ${colorClass}`}
        >
          {label}
           {betOnThis && (
            <div className="absolute z-10 flex items-center justify-center w-8 h-8 text-xs font-black text-black border-2 border-white rounded-full shadow-lg bg-gradient-to-br from-yellow-300 to-yellow-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              {betOnThis.amount}
            </div>
          )}
        </div>
     )
  }

  const row1 = Array.from({length: 12}, (_, i) => 3 + i*3);
  const row2 = Array.from({length: 12}, (_, i) => 2 + i*3);
  const row3 = Array.from({length: 12}, (_, i) => 1 + i*3);

  return (
    <div className="roulette-page leaderboard-host">
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
            <span className="game-title-word">RULETKA</span>
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

      {showWin && (
          <div className={`win-overlay ${isFadingOut ? 'fade-out' : ''}`}>
            <div className="win-banner">
              <h2 className="win-text">{t('games.roulette.win')}</h2>
              <p className="win-amount">{winAmount.toLocaleString()} PLN</p>
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

      <div className="flex-1 w-full max-w-[1500px] mx-auto flex flex-row gap-8 items-center justify-center relative z-10 px-8 py-4 leaderboard-host overflow-hidden">
        
        <div className="flex flex-col items-center justify-center shrink-0">
           <div className="relative transition-transform duration-700 transform">
             <RouletteWheel 
               rotation={wheelRotation} 
               isSpinning={isSpinning} 
               numbers={WHEEL_NUMBERS} 
               isRed={isRed} 
             />
           </div>
        </div>

        <div className="flex-1 min-w-0 max-w-[700px] bg-slate-900/95 p-5 rounded-2xl border-2 border-cyan-500/30 shadow-lg relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

           <div className="relative z-10 flex flex-col items-center gap-4">
              
              <div className="flex flex-col w-full gap-2 select-none">
                  <div className="flex overflow-hidden border-2 shadow-inner bg-slate-900 border-cyan-500/50 rounded-xl">
                     
                     <div 
                       onClick={() => placeBet('NUMBER', 0)} 
                       className="relative flex items-center justify-center w-14 text-2xl font-black text-green-400 transition-all border-r-2 cursor-pointer bg-green-500/10 border-cyan-500/30 hover:bg-green-500/20 group"
                     >
                        <span className="drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] -rotate-90">0</span>
                        <div className="absolute inset-0 transition-colors bg-white/0 group-hover:bg-white/5"></div>
                        {bets.find(b => b.type === 'NUMBER' && b.value === 0) && (
                          <div className="absolute z-10 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center justify-center text-black text-xs font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce">
                            {bets.find(b => b.type === 'NUMBER' && b.value === 0)?.amount}
                          </div>
                        )}
                     </div>
                     
                     <div className="flex flex-col flex-1">
                        <div className="flex">
                           <div className="grid flex-1 grid-cols-12">
                              {row1.map(renderNumberCell)}
                           </div>
                        </div>
                        <div className="flex">
                           <div className="grid flex-1 grid-cols-12">
                              {row2.map(renderNumberCell)}
                           </div>
                        </div>
                        <div className="flex">
                           <div className="grid flex-1 grid-cols-12">
                              {row3.map(renderNumberCell)}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex mt-2">
                     <div className="w-14 shrink-0"></div>
                     <div className="grid w-full grid-cols-6 gap-1 p-2 overflow-hidden border-2 rounded-xl border-cyan-500/30 bg-slate-900/50">
                        {renderBetArea('1-18', 'HALF', 'LOW', 'bg-cyan-900/40 border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]')}
                        {renderBetArea('EVEN', 'PARITY', 'EVEN', 'bg-purple-900/40 border-purple-700/50 text-purple-300 hover:bg-purple-800/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]')}
                        {renderBetArea('RED', 'COLOR', 'RED', 'bg-red-900/40 border-red-700/50 text-red-300 hover:bg-red-800/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]')}
                        {renderBetArea('BLACK', 'COLOR', 'BLACK', 'bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:shadow-[0_0_15px_rgba(148,163,184,0.3)]')}
                        {renderBetArea('ODD', 'PARITY', 'ODD', 'bg-purple-900/40 border-purple-700/50 text-purple-300 hover:bg-purple-800/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]')}
                        {renderBetArea('19-36', 'HALF', 'HIGH', 'bg-cyan-900/40 border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]')}
                     </div>
                  </div>
              </div>

              <div className="flex items-center gap-4 w-full p-3 bg-black/30 rounded-xl border border-white/10">
                 <div className="flex flex-col items-center gap-1 px-4 border-r border-white/10">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Wynik</span>
                    <div className={`text-3xl font-black ${lastResult === null ? 'text-gray-600' : isRed(lastResult) ? 'text-red-500' : lastResult === 0 ? 'text-green-500' : 'text-white'}`}>
                      {lastResult !== null ? lastResult : '-'}
                    </div>
                 </div>
                 
                 <div className="flex-1">
                    <span className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-slate-500">Historia</span>
                    <div className="flex flex-wrap gap-1.5">
                      {history.length === 0 && <span className="text-xs text-slate-500">Brak</span>}
                      {history.map((num, idx) => (
                        <div 
                          key={idx} 
                          className={`
                            w-8 h-8 rounded-md flex items-center justify-center text-xs font-black border border-white/10 shadow transition-all
                            ${num === 0 ? 'bg-green-600 text-white' : isRed(num) ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'}
                            ${idx === 0 ? 'ring-2 ring-yellow-400 scale-110' : 'opacity-70'}
                          `}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col items-center justify-between w-full gap-3 p-3 border md:flex-row bg-black/20 rounded-xl border-white/5 backdrop-blur-sm">
                  <div className="flex gap-2 p-1">
                     {CHIP_VALUES.map(val => (
                       <Chip 
                         key={val} 
                         value={val} 
                         selected={currentChip === val} 
                         onClick={() => setCurrentChip(val)} 
                       />
                     ))}
                  </div>

                  <div className="flex justify-end flex-1 w-full gap-2 md:w-auto">
                    <button 
                      onClick={clearBets}
                      disabled={isSpinning || bets.length === 0}
                      className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold hover:bg-red-500/20 hover:text-red-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        <span>Wyczyść</span>
                    </button>
                    
                    <button 
                      onClick={spinWheel}
                      disabled={isSpinning}
                      className={`
                        px-10 py-4 rounded-xl font-black text-lg tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.2)]
                        flex items-center justify-center gap-3 transition-all transform
                        ${isSpinning 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                          : 'bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white hover:scale-[1.02] active:scale-[0.98] border border-yellow-400/50 hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]'
                        }
                      `}
                    >
                       {isSpinning ? (
                         <span className="text-xl animate-spin">↻</span>
                       ) : 'SPIN'}
                    </button>
                  </div>
               </div>

           </div>

        </div>

        <div className={`leaderboard-drawer ${leaderboardOpen ? 'open' : 'closed'}`}>
          <div className="leaderboard-panel">
            <Leaderboard gameName="Ruletka" title="🏆 TOP WINS" className="leaderboard-widget" />
          </div>
          <button
            className="leaderboard-toggle"
            onClick={() => setLeaderboardOpen((prev) => !prev)}
            aria-expanded={leaderboardOpen}
            title={leaderboardOpen ? t('games.roulette.hideLeaderboard') : t('games.roulette.showLeaderboard')}
          >
            <span>TOP</span>
          </button>
        </div>

      </div>

    </div>
  );
}