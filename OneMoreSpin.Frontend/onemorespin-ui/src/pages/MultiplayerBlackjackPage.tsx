import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useBlackjackGame } from '../hooks/useBlackjackGame';
import Leaderboard from '../components/Leaderboard';
import { GameCard, type ThemeType } from '../components/GameCard';
import { fireConfetti } from '../utils/confetti';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/MultiplayerBlackjackPage.css';

export const MultiplayerBlackjackPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
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
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showResultOverlay, setShowResultOverlay] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isWin, setIsWin] = useState(false);
    const prevResultRef = useRef<string>("");
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

    // Obsługa powiadomień wygranej/przegranej
    useEffect(() => {
        const myPlayer = table?.players.find(p => p.userId === myUserId);
        if (!myPlayer || !myPlayer.result || myPlayer.result === prevResultRef.current) return;

        prevResultRef.current = myPlayer.result;

        let message = "";
        let won = false;

        if (myPlayer.result === "Win") {
            message = t('games.blackjack.win');
            won = true;
        } else if (myPlayer.result === "Blackjack") {
            message = t('games.blackjack.blackjack');
            won = true;
        } else if (myPlayer.result === "Lose") {
            message = t('games.blackjack.lose');
            won = false;
        } else if (myPlayer.result === "Push") {
            message = t('games.blackjack.push');
            won = false;
        }

        if (message) {
            setResultMessage(message);
            setIsWin(won);
            setShowResultOverlay(true);

            if (won) {
                fireConfetti();
            }

            setTimeout(() => {
                setShowResultOverlay(false);
            }, 3000);
        }
    }, [table, myUserId]);

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

    if (!isConnected) {
        return (
            <div className="bj-game-page">
                <div className="bj-game-status">
                    <div className="bj-game-status-text">🔌 {t('games.blackjack.connecting')}</div>
                </div>
            </div>
        );
    }

    if (!table) {
        return (
            <div className="bj-game-page">
                <div className="bj-game-status">
                    <div className="bj-game-status-text">🚀 {t('games.blackjack.enteringTable')}</div>
                </div>
            </div>
        );
    }

    const myPlayer = table.players.find(p => p.userId === myUserId);
    const currentPlayer = table.currentPlayerIndex >= 0 ? table.players[table.currentPlayerIndex] : null;
    const isMyTurn = currentPlayer?.userId === myUserId;
    const canBet = !table.gameInProgress && (!myPlayer?.currentBet || myPlayer.currentBet === 0);
    const hasBet = myPlayer && myPlayer.currentBet > 0;
    const showDealerSecondCard = table.stage === "DealerTurn" || table.stage === "Showdown";

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
        <div className="bj-game-page leaderboard-host">
            {/* HEADER */}
            <header className="bj-game-header">
                <div className="bj-game-brand">MULTIPLAYER 21</div>
                <div className="bj-game-info">
                    <div className="bj-game-stat">
                        <span className="bj-game-stat-label">{t('games.blackjack.tableLabel')}:</span>
                        <span className="bj-game-stat-value">{table.id}</span>
                    </div>
                    <div className="bj-game-stat">
                        <span className="bj-game-stat-label">{t('games.blackjack.stageLabel')}:</span>
                        <span className="bj-game-stat-value">{table.stage}</span>
                    </div>
                </div>
                <button onClick={() => navigate('/blackjack-lobby')} className="bj-leave-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>{t('games.blackjack.leaveTable')}</span>
                </button>
            </header>

            {/* MAIN GAME AREA */}
            <main className="bj-game-main">
                {/* ANIMOWANE TŁO */}
                <div className="bj-animated-bg">
                    <div className="bj-floating-shape bj-shape-1"></div>
                    <div className="bj-floating-shape bj-shape-2"></div>
                    <div className="bj-floating-shape bj-shape-3"></div>
                </div>

                {/* STÓŁ BLACKJACKOWY */}
                <div className="bj-table-container">
                    <div className={`bj-table bj-table-${currentTheme}`}>
                        {/* DEALER */}
                        <div className="bj-dealer-area">
                            <div className="bj-dealer-label">Dealer</div>
                            <div className="bj-dealer-cards">
                                {table.dealerHand.map((c, i) => (
                                    <GameCard
                                        key={i}
                                        card={c}
                                        hidden={i === 1 && !showDealerSecondCard}
                                        theme={currentTheme}
                                    />
                                ))}
                                {table.dealerHand.length === 0 && (
                                    <>
                                        <GameCard theme={currentTheme} hidden />
                                        <GameCard theme={currentTheme} hidden />
                                    </>
                                )}
                            </div>
                            {showDealerSecondCard && (
                                <div className="bj-dealer-score">
                                    {table.dealerBusted ? "BUST!" : table.dealerScore}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GRACZE - poza stołem, pod nim */}
                    <div className="bj-players-container">
                        {sortedPlayers.map((p) => {
                            const isActiveTurn = table.currentPlayerIndex >= 0 && table.players[table.currentPlayerIndex]?.userId === p.userId;
                            const isMe = p.userId === myUserId;

                            let seatClasses = "bj-player-seat";
                            if (isMe) seatClasses += " bj-is-me";
                            if (isActiveTurn) seatClasses += " bj-active-turn";
                            if (p.hasBusted) seatClasses += " bj-busted";
                            if (p.isVip) seatClasses += " bj-is-vip";

                            return (
                                <div key={p.userId} className={seatClasses}>
                                    {isActiveTurn && <div className="bj-badge-turn">{t('games.blackjack.yourTurn')}</div>}
                                    {p.isVip && <div className="bj-badge-vip">👑 VIP</div>}

                                    <div className={`bj-player-name ${p.isVip ? 'bj-vip-name' : ''}`}>
                                        {p.isVip && <span className="bj-vip-crown">👑</span>}
                                        {p.username.split('@')[0]} {isMe && `(${t('common.you')})`}
                                    </div>

                                    <div className="bj-player-cards">
                                        {p.hand && p.hand.length > 0 ? (
                                            p.hand.map((c, idx) => <GameCard key={idx} card={c} theme={currentTheme} />)
                                        ) : (
                                            <div className="bj-empty-hand">{t('games.blackjack.waiting')}</div>
                                        )}
                                    </div>

                                    <div className="bj-player-info">
                                        {p.hand && p.hand.length > 0 && (
                                            <span className="bj-player-score">{p.hasBusted ? "BUST" : p.score}</span>
                                        )}
                                        <span className="bj-player-chips">${p.chips}</span>
                                        {p.currentBet > 0 && <span className="bj-player-bet">${p.currentBet}</span>}
                                    </div>

                                    {p.result && (
                                        <div className={`bj-result-badge bj-${p.result.toLowerCase()}`}>
                                            {p.result === "Win" && `🏆 ${t('games.blackjack.win')}`}
                                            {p.result === "Lose" && `❌ ${t('games.blackjack.lose')}`}
                                            {p.result === "Push" && `🤝 ${t('games.blackjack.push')}`}
                                            {p.result === "Blackjack" && "🎰 BLACKJACK!"}
                                        </div>
                                    )}

                                    {p.hasBlackjack && !p.result && <div className="bj-badge-blackjack">BLACKJACK!</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* PANEL LOGÓW */}
            <div className="bj-log-panel">
                <div className="bj-log-header">
                    {t('games.blackjack.historyTitle')} <span style={{ color: '#4caf50' }}>● Live</span>
                </div>
                <div className="bj-log-content">
                    {logs.map((log, i) => {
                        let c = 'rgba(255,255,255,0.7)';
                        if (log.includes("WYGRANA") || log.includes("Wygrana") || log.includes("BLACKJACK")) c = '#4caf50';
                        if (log.includes("PRZEGRANA") || log.includes("Przegrana") || log.includes("BUST")) c = '#f44336';
                        if (log.includes("Remis")) c = '#ffd700';
                        return <div key={i} style={{ color: c }}>{log}</div>
                    })}
                    <div ref={logsEndRef} />
                </div>
            </div>

            {/* PANEL CZATU */}
            <div className="bj-chat-panel">
                <div className="bj-chat-header">💬 {t('games.blackjack.tableChat')}</div>
                <div className="bj-chat-messages">
                    {chatMessages && chatMessages.length > 0 ? (
                        chatMessages.map((msg, i) => (
                            <div key={i} className="bj-chat-message">
                                <span className="bj-chat-username" style={{ color: msg.username === myPlayer?.username ? '#667eea' : '#ffd700' }}>
                                    {msg.username}:
                                </span>
                                <span className="bj-chat-text">{msg.text}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{t('games.blackjack.startChat')}</div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="bj-chat-input-area">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('games.blackjack.chatPlaceholder')}
                        className="bj-chat-input"
                    />
                    <button onClick={handleSend} className="bj-chat-send-btn">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            {/* PANEL STEROWANIA */}
            <div className="bj-controls-bar">
                {!table.gameInProgress ? (
                    <>
                        {canBet && (
                            <div className="bj-bet-control">
                                <span className="bj-bet-label">{t('common.bet')}:</span>
                                <button onClick={() => setBetAmount(prev => Math.max(table.minBet, prev - 10))} className="bj-bet-btn">-</button>
                                <span className="bj-bet-value">${betAmount}</span>
                                <button onClick={() => setBetAmount(prev => prev + 10)} className="bj-bet-btn">+</button>
                            </div>
                        )}

                        {canBet && (
                            <button onClick={handlePlaceBet} className="bj-game-btn bj-btn-double">
                                {`${t('games.blackjack.placeBet')} $${betAmount}`}
                            </button>
                        )}

                        {hasBet && (
                            <div style={{ color: '#4caf50', fontWeight: 600 }}>
                                ✅ {t('common.bet')}: ${myPlayer?.currentBet}. {t('common.loading')}
                            </div>
                        )}

                        {table.players.some(p => p.currentBet > 0) && (
                            <button onClick={startRound} className="bj-game-btn bj-btn-start">
                                {table.stage === 'Showdown' ? t('games.blackjack.nextRound') : t('games.blackjack.dealCards')}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {myPlayer && !myPlayer.hasStood && !myPlayer.hasBusted && myPlayer.currentBet > 0 && (
                            <>
                                {isMyTurn ? (
                                    <>
                                        <button onClick={hit} className="bj-game-btn bj-btn-hit">{t('games.blackjack.hit')}</button>
                                        <button onClick={stand} className="bj-game-btn bj-btn-stand">{t('games.blackjack.stand')}</button>
                                        {myPlayer.hand?.length === 2 && myPlayer.chips >= myPlayer.currentBet && (
                                            <button onClick={double} className="bj-game-btn bj-btn-double">{t('games.blackjack.double')}</button>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {t('common.loading')} <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{currentPlayer?.username}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {myPlayer && (myPlayer.hasStood || myPlayer.hasBusted) && (
                            <div style={{ color: myPlayer.hasBusted ? '#f44336' : '#4caf50' }}>
                                {myPlayer.hasBusted ? "💥 BUST" : `✋ ${t('games.blackjack.stand')}. ${t('common.loading')}`}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* LEADERBOARD - wysuwany panel z lewej strony */}
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
                    <i className={`fas fa-trophy`}></i>
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
