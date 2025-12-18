import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePokerGame } from '../hooks/usePokerGame';
import Leaderboard from '../components/Leaderboard';
import { GameCard, type ThemeType } from '../components/GameCard';
import { fireConfetti } from '../utils/confetti';
import '../styles/PokerPage.css';

export const PokerPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    // Używamy ID z URL lub domyślnego
    const currentTableId = tableId || "stol-1";
    
    // Rozszerzamy destrukturyzację o chatMessages i sendChatMessage
    const { table, logs, isConnected, startGame, move, myUserId, chatMessages, sendChatMessage } = usePokerGame(currentTableId);
    
    const [raiseAmount, setRaiseAmount] = useState(100);
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [showResultOverlay, setShowResultOverlay] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isWin, setIsWin] = useState(false);
    const prevStageRef = useRef<string>("");
    
    // --- STAN I REF DLA CZATU ---
    const [newMessage, setNewMessage] = useState("");
    const logsEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- WYBÓR MOTYWU NA PODSTAWIE ID STOŁU ---
    let currentTheme: ThemeType = 'beginner';
    if (currentTableId.includes('stol-2')) currentTheme = 'advanced';
    if (currentTableId.includes('vip')) currentTheme = 'vip';

    // Auto-scroll dla logów gry
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // Auto-scroll dla czatu
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    // Obsługa powiadomień wygranej/przegranej dla pokera
    useEffect(() => {
        if (!table || table.stage !== 'Showdown' || prevStageRef.current === 'Showdown') return;
        
        prevStageRef.current = table.stage;
        
        const myPlayer = table.players.find(p => p.userId === myUserId);
        if (!myPlayer || myPlayer.isFolded) return;

        // Sprawdzamy czy ktoś wygrał
        const activePlayers = table.players.filter(p => !p.isFolded);
        if (activePlayers.length === 0) return;

        // Znajdź gracza z największą pulą (najprostszy sposób - możesz to ulepszyć)
        // W prawdziwym pokerze backend powinien wysyłać info o zwycięzcy
        const maxChips = Math.max(...activePlayers.map(p => p.chips));
        const winners = activePlayers.filter(p => p.chips === maxChips);
        
        const didIWin = winners.some(w => w.userId === myUserId);
        
        if (didIWin) {
            setResultMessage("WYGRANA!");
            setIsWin(true);
            fireConfetti();
        } else {
            setResultMessage("PRZEGRANA");
            setIsWin(false);
        }

        setShowResultOverlay(true);
        setTimeout(() => {
            setShowResultOverlay(false);
        }, 3000);
    }, [table, myUserId]);

    // Obsługa wysyłania wiadomości
    const handleSend = () => {
        if (!newMessage.trim()) return;
        // Sprawdzenie czy funkcja istnieje (dla bezpieczeństwa, jeśli hook nie został jeszcze zaktualizowany)
        if (sendChatMessage) {
            sendChatMessage(newMessage);
            setNewMessage("");
        }
    };

    if (!isConnected) return <div className="poker-container" style={{justifyContent:'center'}}><h2>🔌 Łączenie z kasynem...</h2></div>;
    if (!table) return <div className="poker-container" style={{justifyContent:'center'}}><h2>🚀 Wchodzenie do stołu...</h2></div>;

    const myPlayer = table.players.find(p => p.userId === myUserId);
    const currentPlayer = table.players[table.currentPlayerIndex];
    const isMyTurn = currentPlayer?.userId === myUserId;
    const minBet = table.currentMinBet || 0;
    const myBet = myPlayer?.currentBet || 0;
    const toCall = minBet - myBet;

    // Pozycjonowanie graczy (Elipsa) - gracze względem wrappera
    const getPosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI + (Math.PI / 2);
        // Promień dostosowany do wrappera (gracze na zewnątrz stołu)
        const x = 50 + 42 * Math.cos(angle); 
        const y = 50 + 42 * Math.sin(angle);
        return { top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' };
    };

    let sortedPlayers = [...table.players];
    const myIndex = sortedPlayers.findIndex(p => p.userId === myUserId);
    if (myIndex !== -1) {
        const part1 = sortedPlayers.slice(myIndex);
        const part2 = sortedPlayers.slice(0, myIndex);
        sortedPlayers = [...part1, ...part2];
    }

    return (
        <div className="poker-container leaderboard-host">
            {/* ANIMOWANE TŁO */}
            <div className="animated-bg">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>

            {/* HEADER - identyczny jak Blackjack */}
            <header className="poker-header">
                <div className="poker-brand">TEXAS HOLD'EM</div>
                <div className="poker-info">
                    <div className="poker-stat">
                        <span className="poker-stat-label">Stół:</span>
                        <span className="poker-stat-value">{table.id}</span>
                    </div>
                    <div className="poker-stat">
                        <span className="poker-stat-label">Etap:</span>
                        <span className="poker-stat-value-gold">{table.stage}</span>
                    </div>
                </div>
                <button onClick={() => navigate('/poker')} className="poker-leave-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Wyjdź</span>
                </button>
            </header>

            {/* WRAPPER NA STÓŁ I GRACZY */}
            <div className="poker-game-wrapper">
                {/* STÓŁ Z KLASĄ MOTYWU */}
                <div className={`poker-table table-theme-${currentTheme}`}>
                    <div className="table-center-content">
                        <div className="pot-display">PULA <span className="pot-amount">${table.pot}</span></div>
                        
                        <div className="community-cards">
                            {table.communityCards.map((c, i) => <GameCard key={i} card={c} theme={currentTheme} />)}
                            {table.communityCards.length === 0 && <div className="empty-flop-slot">FLOP</div>}
                        </div>
                    </div>
                </div>

                {/* GRACZE - pozycjonowani względem wrappera */}
                {sortedPlayers.map((p, i) => {
                    const isActiveTurn = table.players[table.currentPlayerIndex]?.userId === p.userId;
                    
                    const isMe = p.userId === myUserId; 
                    
                    const pos = getPosition(i, table.players.length);
                    
                    const showCards = isMe || (table.stage === 'Showdown' && !p.isFolded);
                    
                    const isAllIn = !p.isFolded && p.chips === 0 && table.gameInProgress;

                    let seatClasses = "player-seat";
                    if (isMe) seatClasses += " is-me";
                    if (isActiveTurn) seatClasses += " active-turn";
                    if (p.isFolded) seatClasses += " folded";

                    return (
                        <div key={p.userId} className={seatClasses} style={pos}>
                            {isActiveTurn && <div className="badge-turn">Ruch</div>}
                            
                            <div className="player-name">{p.username.split('@')[0]} {isMe && "(Ty)"}</div>
                            
                            <div className="player-cards">
                                {p.hand && p.hand.length > 0 ? (
                                    p.hand.map((c, idx) => <GameCard key={idx} card={showCards ? c : undefined} theme={currentTheme} />)
                                ) : (
                                    <><GameCard theme={currentTheme} /><GameCard theme={currentTheme} /></>
                                )}
                            </div>

                            <div className="player-stats">
                                <span className="chips-count">${p.chips}</span>
                                {p.currentBet > 0 && <span className="bet-amount">${p.currentBet}</span>}
                            </div>

                            {p.isFolded && <div className="overlay-fold">PAS</div>}
                            {isAllIn && <div className="badge-allin">ALL-IN</div>}
                        </div>
                    );
                })}
            </div>

            {/* PANEL LOGÓW (LEWA STRONA) */}
            <div className="log-panel">
                <div className="log-header">
                    <span>HISTORIA GRY</span><span style={{color: '#66bb6a'}}>● Live</span>
                </div>
                <div className="log-content">
                    {logs.map((log, i) => {
                        let c = '#bbb';
                        if(log.includes("WYGRAŁ")) c = '#66bb6a';
                        if(log.includes("Układ")) c = '#ffd700';
                        if(log.includes("PAS")) c = '#ef5350';
                        return <div key={i} style={{color: c}}>{log}</div>
                    })}
                    <div ref={logsEndRef} />
                </div>
            </div>

            {/* PANEL CZATU - PO LEWEJ STRONIE POD LOGAMI */}
            <div className="chat-panel-widget">
                <div className="chat-header">
                    <span>💬 CZAT STOŁU</span>
                </div>

                <div className="chat-messages">
                    {chatMessages && chatMessages.length > 0 ? (
                        chatMessages.map((msg, i) => (
                            <div key={i} className="chat-message">
                                <span className={`chat-username ${msg.username === myPlayer?.username ? 'is-me' : ''}`}>
                                    {msg.username.split('@')[0]}:
                                </span>
                                <span className="chat-text">{msg.text}</span>
                            </div>
                        ))
                    ) : (
                        <div className="chat-empty">
                            Rozpocznij rozmowę...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-input-area">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Napisz wiadomość..."
                        className="chat-input"
                    />
                    <button 
                        onClick={handleSend}
                        className="chat-send-btn"
                    >
                        ➤
                    </button>
                </div>
            </div>

            <div className="controls-bar">
                {!table.gameInProgress ? (
                    <button onClick={startGame} className="poker-btn btn-start">
                        {table.stage === 'Showdown' ? "NASTĘPNE ROZDANIE" : "ROZDAJ KARTY"}
                    </button>
                ) : (
                    <>
                        {myPlayer && !myPlayer.isFolded && (
                            <>
                                {isMyTurn ? (
                                    <>
                                        <button onClick={() => move("FOLD", 0)} className="poker-btn btn-fold">PAS</button>
                                        
                                        {toCall === 0 ? (
                                            <button onClick={() => move("CHECK", 0)} className="poker-btn btn-check">CZEKAJ</button>
                                        ) : (
                                            <button onClick={() => move("CALL", 0)} className="poker-btn btn-call">SPRAWDŹ (${toCall})</button>
                                        )}
                                        
                                        <div className="raise-control">
                                            <input 
                                                type="number" 
                                                value={raiseAmount} 
                                                onChange={e => setRaiseAmount(Number(e.target.value))}
                                                className="raise-input"
                                            />
                                            <button onClick={() => move("RAISE", raiseAmount)} className="poker-btn btn-raise">PODBIJ</button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{color: '#888', fontStyle: 'italic', alignSelf: 'center'}}>
                                        Czekaj na ruch gracza: <span style={{color:'#fff', fontWeight:'bold'}}>{currentPlayer?.username.split('@')[0]}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {myPlayer && myPlayer.isFolded && <div style={{color: '#ef5350', fontWeight: 'bold'}}>SPASOWAŁEŚ</div>}
                    </>
                )}
            </div>

            <div className={`leaderboard-drawer ${leaderboardOpen ? 'open' : 'closed'}`}>
                <div className="leaderboard-panel">
                    <Leaderboard gameId={4} title="🏆 TOP WINS" className="leaderboard-widget" />
                </div>
                <button
                    className="leaderboard-toggle"
                    onClick={() => setLeaderboardOpen(prev => !prev)}
                    aria-expanded={leaderboardOpen}
                    title={leaderboardOpen ? 'Schowaj ranking' : 'Pokaż ranking'}
                >
                    <i className="fas fa-trophy"></i>
                    <span>TOP</span>
                </button>
            </div>

            {/* RESULT OVERLAY - identyczny jak w singleplayer */}
            {showResultOverlay && (
                <div className="sp-result-overlay">
                    <div className={`sp-result-text ${isWin ? 'sp-win' : 'sp-lose'}`}>
                        {resultMessage}
                    </div>
                </div>
            )}
        </div>
    );
};
