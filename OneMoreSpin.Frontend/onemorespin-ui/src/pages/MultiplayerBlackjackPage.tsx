import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlackjackGame } from '../hooks/useBlackjackGame';
import { Suit, type Card } from '../types/blackjack';
import Leaderboard from '../components/Leaderboard';
import '../styles/MultiplayerBlackjackPage.css';

// --- TYPY MOTYWÓW ---
type ThemeType = 'beginner' | 'advanced' | 'vip';

// --- KOMPONENT KARTY ---
const CardView = ({ card, hidden, theme }: { card?: Card, hidden?: boolean, theme: ThemeType }) => {
    const themeClass = `card-theme-${theme}`;

    if (!card || hidden) return <div className={`blackjack-card ${themeClass}`}><div className="card-back" /></div>;

    const suitSymbols = ["♥", "♦", "♣", "♠"];
    const rankSymbols: { [key: number]: string } = { 11: "J", 12: "Q", 13: "K", 14: "A" };
    const rankDisplay = rankSymbols[card.rank] || card.rank;
    const isRed = (card.suit === Suit.Hearts || card.suit === Suit.Diamonds);
    const suitClass = isRed ? "red" : "black";

    return (
        <div className={`blackjack-card ${suitClass} ${themeClass}`}>
            <div className="card-rank">{rankDisplay}</div>
            <div className="card-suit">{suitSymbols[card.suit]}</div>
        </div>
    );
};

export const MultiplayerBlackjackPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const currentTableId = tableId || "blackjack-1";

    const {
        table,
        logs,
        isConnected,
        myUserId,
        chatMessages,
        placeBet,
        startRound,
        hit,
        stand,
        double,
        sendChatMessage
    } = useBlackjackGame(currentTableId);

    const [betAmount, setBetAmount] = useState(10);
    const [leaderboardOpen, setLeaderboardOpen] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const logsEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- WYBÓR MOTYWU NA PODSTAWIE ID STOŁU ---
    let currentTheme: ThemeType = 'beginner';
    if (currentTableId.includes('blackjack-2')) currentTheme = 'advanced';
    if (currentTableId.includes('vip')) currentTheme = 'vip';

    // Auto-scroll dla logów
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

    const handleSend = () => {
        if (!newMessage.trim()) return;
        sendChatMessage(newMessage);
        setNewMessage("");
    };

    const handlePlaceBet = () => {
        if (betAmount > 0) {
            placeBet(betAmount);
        }
    };

    if (!isConnected) return <div className="blackjack-mp-container" style={{ justifyContent: 'center' }}><h2>🔌 Łączenie z kasynem...</h2></div>;
    if (!table) return <div className="blackjack-mp-container" style={{ justifyContent: 'center' }}><h2>🚀 Wchodzenie do stołu...</h2></div>;

    const myPlayer = table.players.find(p => p.userId === myUserId);
    const currentPlayer = table.currentPlayerIndex >= 0 ? table.players[table.currentPlayerIndex] : null;
    const isMyTurn = currentPlayer?.userId === myUserId;
    const canBet = !table.gameInProgress && (!myPlayer?.currentBet || myPlayer.currentBet === 0);
    const hasBet = myPlayer && myPlayer.currentBet > 0;
    const showDealerSecondCard = table.stage === "DealerTurn" || table.stage === "Showdown";

    // Pozycjonowanie graczy (półkole nad stołem)
    const getPosition = (index: number, total: number) => {
        // Gracze siedzą w półkolu na górze stołu
        const baseAngle = Math.PI; // Zaczynamy od lewej strony
        const angleSpan = Math.PI; // Półkole
        const angle = baseAngle + (index / (total - 1 || 1)) * angleSpan;
        const x = 50 + 40 * Math.cos(angle);
        const y = 65 + 30 * Math.sin(angle);
        return { top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' };
    };

    // Sortuj graczy tak, żeby mój był na środku
    let sortedPlayers = [...table.players];
    const myIndex = sortedPlayers.findIndex(p => p.userId === myUserId);
    if (myIndex !== -1 && sortedPlayers.length > 1) {
        const middleIndex = Math.floor(sortedPlayers.length / 2);
        if (myIndex !== middleIndex) {
            const player = sortedPlayers.splice(myIndex, 1)[0];
            sortedPlayers.splice(middleIndex, 0, player);
        }
    }

    return (
        <div className="blackjack-mp-container leaderboard-host">
            {/* PASEK STATUSU */}
            <div className="status-bar">
                <button onClick={() => navigate('/blackjack-lobby')} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                    ← Wyjście
                </button>
                <div className="brand-title">ONE MORE SPIN - BLACKJACK</div>
                <div>Stół: <span style={{ color: '#fff' }}>{table.id}</span> | Etap: {table.stage}</div>
            </div>

            {/* STÓŁ BLACKJACKOWY */}
            <div className={`blackjack-table table-theme-${currentTheme}`}>
                {/* DEALER */}
                <div className="dealer-area">
                    <div className="dealer-label">DEALER</div>
                    <div className="dealer-cards">
                        {table.dealerHand.map((c, i) => (
                            <CardView
                                key={i}
                                card={c}
                                hidden={i === 1 && !showDealerSecondCard}
                                theme={currentTheme}
                            />
                        ))}
                        {table.dealerHand.length === 0 && (
                            <>
                                <CardView theme={currentTheme} hidden />
                                <CardView theme={currentTheme} hidden />
                            </>
                        )}
                    </div>
                    {showDealerSecondCard && (
                        <div className="dealer-score">
                            {table.dealerBusted ? "BUST!" : table.dealerScore}
                        </div>
                    )}
                </div>

                {/* GRACZE */}
                {sortedPlayers.map((p, i) => {
                    const isActiveTurn = table.currentPlayerIndex >= 0 && table.players[table.currentPlayerIndex]?.userId === p.userId;
                    const isMe = p.userId === myUserId;
                    const pos = getPosition(i, sortedPlayers.length);

                    let seatClasses = "player-seat";
                    if (isMe) seatClasses += " is-me";
                    if (isActiveTurn) seatClasses += " active-turn";
                    if (p.hasBusted) seatClasses += " busted";

                    return (
                        <div key={p.userId} className={seatClasses} style={pos}>
                            {isActiveTurn && <div className="badge-turn">Ruch</div>}

                            <div className="player-name">{p.username} {isMe && "(Ty)"}</div>

                            <div className="player-cards">
                                {p.hand && p.hand.length > 0 ? (
                                    p.hand.map((c, idx) => <CardView key={idx} card={c} theme={currentTheme} />)
                                ) : (
                                    <div className="empty-hand">Oczekiwanie...</div>
                                )}
                            </div>

                            <div className="player-info">
                                {p.hand && p.hand.length > 0 && (
                                    <span className="score">{p.hasBusted ? "BUST" : p.score}</span>
                                )}
                                <span className="chips-count">${p.chips}</span>
                                {p.currentBet > 0 && <span className="bet-amount">Zakład: ${p.currentBet}</span>}
                            </div>

                            {p.result && (
                                <div className={`result-badge ${p.result.toLowerCase()}`}>
                                    {p.result === "Win" && "🏆 WYGRANA"}
                                    {p.result === "Lose" && "❌ PRZEGRANA"}
                                    {p.result === "Push" && "🤝 REMIS"}
                                    {p.result === "Blackjack" && "🎰 BLACKJACK!"}
                                </div>
                            )}

                            {p.hasBlackjack && !p.result && <div className="badge-blackjack">BLACKJACK!</div>}
                        </div>
                    );
                })}
            </div>

            {/* PANEL LOGÓW */}
            <div className="log-panel">
                <div className="log-header">
                    <span>HISTORIA GRY</span><span style={{ color: '#66bb6a' }}>● Live</span>
                </div>
                <div className="log-content">
                    {logs.map((log, i) => {
                        let c = '#bbb';
                        if (log.includes("WYGRANA") || log.includes("Wygrana") || log.includes("BLACKJACK")) c = '#66bb6a';
                        if (log.includes("PRZEGRANA") || log.includes("Przegrana") || log.includes("BUST")) c = '#ef5350';
                        if (log.includes("Remis")) c = '#ffd700';
                        return <div key={i} style={{ color: c }}>{log}</div>
                    })}
                    <div ref={logsEndRef} />
                </div>
            </div>

            {/* PANEL CZATU */}
            <div className="chat-panel-widget">
                <div className="chat-header">
                    <span>💬 CZAT STOŁU</span>
                </div>
                <div className="chat-messages">
                    {chatMessages && chatMessages.length > 0 ? (
                        chatMessages.map((msg, i) => (
                            <div key={i} className="chat-message">
                                <span className="chat-username" style={{ color: msg.username === myPlayer?.username ? '#66bb6a' : '#ffd700' }}>
                                    {msg.username}:
                                </span>
                                <span className="chat-text">{msg.text}</span>
                            </div>
                        ))
                    ) : (
                        <div className="chat-empty">Rozpocznij rozmowę...</div>
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
                    />
                    <button onClick={handleSend}>➤</button>
                </div>
            </div>

            {/* PANEL STEROWANIA */}
            <div className="controls-bar">
                {!table.gameInProgress ? (
                    <>
                        {canBet && (
                            <div className="bet-control">
                                <button onClick={() => setBetAmount(prev => Math.max(table.minBet, prev - 10))} className="bet-adjust-btn">-</button>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={e => setBetAmount(Number(e.target.value))}
                                    className="bet-input"
                                    min={table.minBet}
                                />
                                <button onClick={() => setBetAmount(prev => prev + 10)} className="bet-adjust-btn">+</button>
                                <button onClick={handlePlaceBet} className="blackjack-btn btn-bet">
                                    POSTAW ${betAmount}
                                </button>
                            </div>
                        )}

                        {hasBet && (
                            <div className="waiting-message">
                                ✅ Postawiłeś ${myPlayer?.currentBet}. Czekaj na innych graczy...
                            </div>
                        )}

                        {table.players.some(p => p.currentBet > 0) && (
                            <button onClick={startRound} className="blackjack-btn btn-start">
                                {table.stage === 'Showdown' ? "NASTĘPNA RUNDA" : "ROZPOCZNIJ GRĘ"}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {myPlayer && !myPlayer.hasStood && !myPlayer.hasBusted && myPlayer.currentBet > 0 && (
                            <>
                                {isMyTurn ? (
                                    <>
                                        <button onClick={hit} className="blackjack-btn btn-hit">DOBIERZ</button>
                                        <button onClick={stand} className="blackjack-btn btn-stand">STÓJ</button>
                                        {myPlayer.hand?.length === 2 && myPlayer.chips >= myPlayer.currentBet && (
                                            <button onClick={double} className="blackjack-btn btn-double">PODWÓJ</button>
                                        )}
                                    </>
                                ) : (
                                    <div className="waiting-message">
                                        Czekaj na ruch gracza: <span style={{ color: '#fff', fontWeight: 'bold' }}>{currentPlayer?.username}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {myPlayer && (myPlayer.hasStood || myPlayer.hasBusted) && (
                            <div className="waiting-message">
                                {myPlayer.hasBusted ? "💥 Przekroczyłeś 21!" : "✋ Stoisz. Czekaj na innych..."}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* LEADERBOARD */}
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
                    <Leaderboard gameId={2} title="TOP WINS" className="leaderboard-widget" />
                </div>
            </div>
        </div>
    );
};
