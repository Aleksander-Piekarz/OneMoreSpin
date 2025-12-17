import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePokerGame } from '../hooks/usePokerGame';
import { Suit, type Card } from '../types/poker'; 
import Leaderboard from '../components/Leaderboard';
import '../styles/PokerPage.css';

// --- TYPY MOTYWÓW ---
type ThemeType = 'beginner' | 'advanced' | 'vip';

// --- KOMPONENT KARTY ---
// Przyjmuje props 'theme', żeby wiedzieć jaki rewers wyświetlić
const CardView = ({ card, theme }: { card?: Card, theme: ThemeType }) => {
    // Klasa determinująca wygląd rewersu
    const themeClass = `card-theme-${theme}`;

    if (!card) return <div className={`poker-card ${themeClass}`}><div className="card-back" /></div>;

    const suitSymbols = ["♥", "♦", "♣", "♠"];
    // @ts-ignore
    const rankSymbols = { 11: "J", 12: "Q", 13: "K", 14: "A" };
    // @ts-ignore
    const rankDisplay = rankSymbols[card.rank] || card.rank;
    // @ts-ignore
    const isRed = (card.suit === Suit.Hearts || card.suit === Suit.Diamonds);
    const suitClass = isRed ? "red" : "black";

    return (
        <div className={`poker-card ${suitClass} ${themeClass}`}>
            <div className="card-rank">{rankDisplay}</div>
            <div className="card-suit">{suitSymbols[card.suit]}</div>
        </div>
    );
};

export const PokerPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    // Używamy ID z URL lub domyślnego
    const currentTableId = tableId || "stol-1";
    
    // Rozszerzamy destrukturyzację o chatMessages i sendChatMessage
    const { table, logs, isConnected, startGame, move, myUserId, chatMessages, sendChatMessage } = usePokerGame(currentTableId);
    
    const [raiseAmount, setRaiseAmount] = useState(100);
    const [leaderboardOpen, setLeaderboardOpen] = useState(true);
    
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

    // Pozycjonowanie graczy (Elipsa)
    const getPosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI + (Math.PI / 2);
        const x = 50 + 42 * Math.cos(angle); 
        const y = 50 + 38 * Math.sin(angle);
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
            {/* PASEK STATUSU */}
            <div className="status-bar">
                <button onClick={() => navigate('/poker')} style={{background:'transparent', border:'1px solid #555', color:'#aaa', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>
                    ← Wyjście
                </button>
                <div className="brand-title">ONE MORE SPIN</div>
                <div>Stół: <span style={{color:'#fff'}}>{table.id}</span> | Etap: {table.stage}</div>
            </div>

            {/* STÓŁ Z KLASĄ MOTYWU */}
            <div className={`poker-table table-theme-${currentTheme}`}>
                
                <div className="table-center-content">
                    <div className="pot-display">PULA <span className="pot-amount">${table.pot}</span></div>
                    
                    <div className="community-cards">
                        {table.communityCards.map((c, i) => <CardView key={i} card={c} theme={currentTheme} />)}
                        {table.communityCards.length === 0 && <div className="empty-flop-slot">FLOP</div>}
                    </div>
                </div>

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
                            
                            <div className="player-name">{p.username} {isMe && "(Ty)"}</div>
                            
                            <div className="player-cards">
                                {p.hand && p.hand.length > 0 ? (
                                    p.hand.map((c, idx) => <CardView key={idx} card={showCards ? c : undefined} theme={currentTheme} />)
                                ) : (
                                    <><CardView theme={currentTheme} /><CardView theme={currentTheme} /></>
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

            {/* PANEL CZATU (NOWY - PRAWA STRONA, NAD KONTROLKAMI LUB PO BOKU) */}
            <div className="chat-panel-widget" style={{
                position: 'absolute',
                bottom: '100px',
                right: '20px',
                width: '320px',
                height: '250px',
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid #444',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}>
                <div className="chat-header" style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #444',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                }}>
                    <span>💬 CZAT STOŁU</span>
                </div>

                <div className="chat-messages" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    scrollbarWidth: 'thin',
                }}>
                    {chatMessages && chatMessages.length > 0 ? (
                        chatMessages.map((msg, i) => (
                            <div key={i} style={{ fontSize: '0.85rem', lineHeight: '1.3', wordBreak: 'break-word' }}>
                                <span style={{ color: msg.username === myPlayer?.username ? '#66bb6a' : '#ffd700', fontWeight: 'bold', marginRight: '5px' }}>
                                    {msg.username}:
                                </span>
                                <span style={{ color: '#eee' }}>{msg.text}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{color: '#666', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center', marginTop: '10px'}}>
                            Rozpocznij rozmowę...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-input-area" style={{
                    padding: '8px',
                    borderTop: '1px solid #444',
                    display: 'flex',
                    gap: '5px',
                    background: 'rgba(0,0,0,0.3)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px'
                }}>
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Napisz wiadomość..."
                        style={{
                            flex: 1,
                            background: '#333',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: 'white',
                            padding: '6px 10px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <button 
                        onClick={handleSend}
                        style={{
                            background: '#66bb6a',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0 12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}
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
                                        Czekaj na ruch gracza: <span style={{color:'#fff', fontWeight:'bold'}}>{currentPlayer?.username}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {myPlayer && myPlayer.isFolded && <div style={{color: '#ef5350', fontWeight: 'bold'}}>SPASOWAŁEŚ</div>}
                    </>
                )}
            </div>

            <div className={`leaderboard-drawer left ${leaderboardOpen ? 'open' : 'closed'}`}>
                <button
                    className="leaderboard-toggle"
                    onClick={() => setLeaderboardOpen(prev => !prev)}
                    aria-expanded={leaderboardOpen}
                >
                    <i className={`fas ${leaderboardOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                    <span>{leaderboardOpen ? 'Schowaj' : 'Top wins'}</span>
                </button>
                <div className="leaderboard-panel">
                    <Leaderboard gameId={4} title="TOP WINS" className="leaderboard-widget" />
                </div>
            </div>
        </div>
    );
};