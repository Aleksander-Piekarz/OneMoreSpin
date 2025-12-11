import { useState, useEffect } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { refreshMissions } from "../events";
import "../styles/RoulettePage.css";

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const CHIP_VALUES = [10, 50, 100, 500];

// Typy zakładów
type BetType = 'NUMBER' | 'COLOR' | 'PARITY' | 'HALF';
type BetValue = number | 'RED' | 'BLACK' | 'EVEN' | 'ODD' | 'LOW' | 'HIGH';

interface Bet {
  type: BetType;
  value: BetValue;
  amount: number;
}


const Chip = ({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) => {
  const getColor = (val: number) => {
    if (val === 10) return 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.6)]';
    if (val === 50) return 'bg-red-600 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]';
    if (val === 100) return 'bg-green-600 border-green-400 shadow-[0_0_15px_rgba(22,163,74,0.6)]';
    return 'bg-black border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-16 h-16 rounded-full border-[6px] flex items-center justify-center font-black text-lg shadow-xl transition-all duration-300
        ${getColor(value)}
        ${selected ? 'scale-125 -translate-y-4 ring-4 ring-white z-20' : 'hover:scale-110 hover:-translate-y-2 opacity-90 hover:opacity-100'}
        text-white
      `}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20 border-dashed animate-[spin_10s_linear_infinite]"></div>
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
    <div className="relative w-[400px] h-[400px] md:w-[550px] md:h-[550px] flex items-center justify-center">
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

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center justify-center leading-none"
             style={{ 
                fontFamily: "'Big Shoulders', 'Bebas Neue', 'Poppins', sans-serif",
                textShadow: "2px 2px 0px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"
             }}>
            <span className="text-white font-black tracking-widest text-[12px] md:text-[18px] pb-1">ONE MORE</span>
            <span className="text-white font-black tracking-widest text-[14px] md:text-[20px]">SPIN!</span>
        </div>
      </div>
    </div>
  );
};


export default function RouletteGame() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
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

  useEffect(() => {
    api.auth.me().then((user: any) => {
        if(user && user.balance !== undefined) {
            setBalance(user.balance);
        }
    }).catch(err => console.error("Failed to fetch user info", err));
  }, []);

  const isRed = (num: number) => RED_NUMBERS.includes(num);

  // --- Logika Gry ---

  const placeBet = (type: BetType, value: BetValue) => {
    if (isSpinning) return;
    if (balance < currentChip) {
      return;
    }

    setBalance(prev => prev - currentChip);
    
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
    setBalance(prev => prev + totalRefund);
    setBets([]);
  };

  const spinWheel = async () => {
    if (bets.length === 0) {
      return;
    }
    if (isSpinning) return;

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
        });

        const winningNumber = result.winNumber;

        // logika rotacji
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
        console.error(error.message || "Błąd gry");
        api.auth.me().then((u: any) => setBalance(u.balance));
    }
  };

  const resolveGame = (result: any) => {
    setLastResult(result.winNumber);
    setHistory(prev => [result.winNumber, ...prev].slice(0, 10));
    setIsSpinning(false);
    
    const totalCurrentBets = bets.reduce((acc, bet) => acc + bet.amount, 0);
    
    if (result.balance >= totalCurrentBets) {
        setBalance(result.balance - totalCurrentBets);
    } else {
        setBalance(result.balance);
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
          relative flex items-center justify-center border h-20 cursor-pointer hover:brightness-125 transition-all font-black text-2xl
          ${colorClass}
        `}
      >
        <span className="drop-shadow-md">{num}</span>
        {betOnThis && (
          <div className="absolute z-10 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center justify-center text-sm font-black text-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform hover:scale-110 transition-transform">
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
          className={`relative flex items-center justify-center h-16 border-2 cursor-pointer hover:brightness-125 font-bold text-white transition-all uppercase text-lg tracking-wider ${colorClass}`}
        >
          {label}
           {betOnThis && (
            <div className="absolute z-10 flex items-center justify-center w-12 h-12 text-sm font-black text-black transition-transform transform -translate-x-1/2 -translate-y-1/2 border-[3px] border-white rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] bg-gradient-to-br from-yellow-300 to-yellow-500 top-1/2 left-1/2 hover:scale-110">
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
    <div className="roulette-page">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <header className="roulette-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <ArrowLeft size={20} />
          <span>POWRÓT</span>
        </button>
        
        <div className="roulette-title">
          <span className="title-word">NEON</span>
          <span className="title-word">ROULETTE</span>
        </div>

        <div className="balance-display">
          <i className="fas fa-coins"></i>
          <span>{balance.toLocaleString()} PLN</span>
        </div>
      </header>

      {showWin && (
          <div className={`win-overlay ${isFadingOut ? 'fade-out' : ''}`}>
            <div className="win-banner">
              <h2 className="win-text">WYGRANA!</h2>
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

      <div className="w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-24 items-center justify-center relative z-10 px-4 mt-24">
        
        <div className="flex flex-col items-center justify-center w-full gap-8 xl:w-auto xl:sticky xl:top-8">
           <div className="relative pb-5 transition-transform duration-700 transform scale-100 xl:scale-110">
             <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
             
             <RouletteWheel 
               rotation={wheelRotation} 
               isSpinning={isSpinning} 
               numbers={WHEEL_NUMBERS} 
               isRed={isRed} 
             />
           </div>

           <div className="w-full max-w-[400px] bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                 <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Ostatni Wynik</span>
                 <div className={`text-3xl font-black ${lastResult === null ? 'text-gray-600' : isRed(lastResult) ? 'text-red-500' : lastResult === 0 ? 'text-green-500' : 'text-white'}`}>
                   {lastResult !== null ? lastResult : '-'}
                 </div>
              </div>
              
              <div>
                 <span className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400">Historia</span>
                 <div className="flex flex-wrap justify-center gap-2">
                   {history.length === 0 && <span className="w-full py-2 text-sm font-medium text-center text-slate-500">Brak historii</span>}
                   {history.map((num, idx) => (
                     <div 
                       key={idx} 
                       className={`
                         w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black border border-white/10 shadow-lg transition-all
                         ${num === 0 ? 'bg-green-600 text-white' : isRed(num) ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}
                         ${idx === 0 ? 'ring-2 ring-yellow-400 scale-110 z-10' : 'opacity-80'}
                       `}
                     >
                       {num}
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 w-full bg-slate-900/95 p-8 rounded-[2.5rem] border-4 border-cyan-500/30 shadow-[0_0_100px_rgba(6,182,212,0.1)] relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="relative z-10 flex flex-col items-center gap-8">
              
              <div className="flex flex-col w-full gap-2 select-none">
                  <div className="flex overflow-hidden border-2 shadow-inner bg-slate-900 border-cyan-500/50 rounded-xl">
                     
                     <div 
                       onClick={() => placeBet('NUMBER', 0)} 
                       className="relative flex items-center justify-center w-20 text-3xl font-black text-green-400 transition-all border-r-2 cursor-pointer bg-green-500/10 border-cyan-500/30 hover:bg-green-500/20 group"
                     >
                        <span className="drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] -rotate-90">0</span>
                        <div className="absolute inset-0 transition-colors bg-white/0 group-hover:bg-white/5"></div>
                        {bets.find(b => b.type === 'NUMBER' && b.value === 0) && (
                          <div className="absolute z-10 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center justify-center text-black text-sm font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce">
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
                     <div className="w-20 shrink-0"></div>
                     <div className="grid w-full grid-cols-6 gap-2 p-2 overflow-hidden border-2 rounded-xl border-cyan-500/30 bg-slate-900/50">
                        {renderBetArea('1-18', 'HALF', 'LOW', 'bg-cyan-900/40 border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]')}
                        {renderBetArea('EVEN', 'PARITY', 'EVEN', 'bg-purple-900/40 border-purple-700/50 text-purple-300 hover:bg-purple-800/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]')}
                        {renderBetArea('RED', 'COLOR', 'RED', 'bg-red-900/40 border-red-700/50 text-red-300 hover:bg-red-800/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]')}
                        {renderBetArea('BLACK', 'COLOR', 'BLACK', 'bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:shadow-[0_0_15px_rgba(148,163,184,0.3)]')}
                        {renderBetArea('ODD', 'PARITY', 'ODD', 'bg-purple-900/40 border-purple-700/50 text-purple-300 hover:bg-purple-800/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]')}
                        {renderBetArea('19-36', 'HALF', 'HIGH', 'bg-cyan-900/40 border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]')}
                     </div>
                  </div>
              </div>

              <div className="flex flex-col items-center justify-between w-full gap-6 p-6 border md:flex-row bg-black/20 rounded-2xl border-white/5 backdrop-blur-sm">
                  <div className="flex gap-4 p-2">
                     {CHIP_VALUES.map(val => (
                       <Chip 
                         key={val} 
                         value={val} 
                         selected={currentChip === val} 
                         onClick={() => setCurrentChip(val)} 
                       />
                     ))}
                  </div>

                  <div className="flex justify-end flex-1 w-full gap-4 md:w-auto">
                    <button 
                      onClick={clearBets}
                      disabled={isSpinning || bets.length === 0}
                      className="px-8 py-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold hover:bg-red-500/20 hover:text-red-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        <span>Wyczyść</span>
                    </button>
                    
                    <button 
                      onClick={spinWheel}
                      disabled={isSpinning}
                      className={`
                        px-12 py-6 rounded-xl font-black text-xl tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.2)]
                        flex items-center justify-center gap-3 transition-all transform
                        ${isSpinning 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                          : 'bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white hover:scale-[1.02] active:scale-[0.98] border border-yellow-400/50 hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]'
                        }
                      `}
                    >
                       {isSpinning ? (
                         <span className="text-2xl animate-spin">↻</span>
                       ) : 'SPIN'}
                    </button>
                  </div>
               </div>

           </div>

        </div>

      </div>


    </div>
  );
}