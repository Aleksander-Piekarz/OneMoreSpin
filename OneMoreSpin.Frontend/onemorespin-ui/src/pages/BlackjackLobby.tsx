import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from "@microsoft/signalr";
import '../styles/BlackjackLobby.css';

interface TableInfo {
    id: string;
    name: string;
    playersCount: number;
    minBet: number;
}

export const BlackjackLobby = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initConnection = async () => {
            if (connectionRef.current) return;

            const newConnection = new signalR.HubConnectionBuilder()
                //.withUrl("http://localhost:5046/blackjackHub", {
                .withUrl("http://91.123.188.186:5173/blackjackHub", { 
                    accessTokenFactory: () => localStorage.getItem("jwt") || ""
                })
                .withAutomaticReconnect()
                .build();

            connectionRef.current = newConnection;

            try {
                await newConnection.start();
                console.log("Blackjack Lobby: Połączono z SignalR");

                if (isMounted) {
                    setIsConnected(true);
                    const data = await newConnection.invoke("GetTables");
                    setTables(data);
                }
            } catch (err: any) {
                if (err.toString().includes("AbortError") || err.toString().includes("invocation canceled")) {
                    console.log("Blackjack Lobby: Połączenie anulowane.");
                } else {
                    console.error("Blackjack Lobby: Błąd połączenia:", err);
                }
            }
        };

        initConnection();
        return () => {
            isMounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, []);

    const joinTable = (tableId: string) => {
        if (connectionRef.current) {
            connectionRef.current.stop();
            connectionRef.current = null;
        }
        navigate(`/blackjack-multi/${tableId}`);
    };

    const getCardVariantClass = (tableId: string) => {
        if (tableId.includes('vip')) return 'bj-card-vip';
        if (tableId.includes('blackjack-2')) return 'bj-card-advanced';
        return 'bj-card-beginner';
    };

    // Sortowanie stołów: Beginner -> Advanced -> VIP
    const sortedTables = [...tables].sort((a, b) => {
        const getOrder = (id: string) => {
            if (id.includes('vip')) return 2;
            if (id.includes('blackjack-2')) return 1;
            return 0;
        };
        return getOrder(a.id) - getOrder(b.id);
    });

    return (
        <div className="bj-lobby-page">
            <div className="bj-lobby-bg">
                <div className="bj-lobby-shape bj-lobby-shape-1"></div>
                <div className="bj-lobby-shape bj-lobby-shape-2"></div>
                <div className="bj-lobby-shape bj-lobby-shape-3"></div>
            </div>

            <header className="bj-lobby-header">
                <button onClick={() => navigate('/blackjack')} className="bj-lobby-back-btn">
                    <i className="fas fa-arrow-left"></i>
                    <span>Powrót</span>
                </button>
                <h1 className="bj-lobby-title">BLACKJACK ROOMS</h1>
                <div className="bj-lobby-spacer"></div>
            </header>

            <div className="bj-lobby-content">
                <p className="bj-lobby-subtitle">Wybierz stół i zacznij grać</p>

                {isConnected ? (
                    <div className="bj-tables-grid">
                        {sortedTables.map((table, index) => {
                            const variantClass = getCardVariantClass(table.id);
                            return (
                                <div 
                                    key={table.id} 
                                    className={`bj-table-card ${variantClass}`}
                                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                                >
                                    <div className="bj-card-shine"></div>
                                    <div className="bj-card-icon-bg">♠</div>
                                    
                                    <h3 className="bj-table-name">{table.name}</h3>
                                    
                                    <div className="bj-table-details">
                                        <div className="bj-detail-item">
                                            <span>👥 Gracze</span>
                                            <span className="bj-detail-value">{table.playersCount} / 5</span>
                                        </div>
                                        <div className="bj-detail-item">
                                            <span>💰 Min. zakład</span>
                                            <span className="bj-detail-value">${table.minBet}</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => joinTable(table.id)} className="bj-join-btn">
                                        Zagraj Teraz
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bj-loading-container">
                        <div className="bj-loading-spinner"></div>
                        <span className="bj-loading-text">Ładowanie stołów...</span>
                    </div>
                )}
            </div>
        </div>
    );
};
