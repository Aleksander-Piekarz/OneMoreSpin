import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import * as signalR from "@microsoft/signalr";
import '../styles/PokerLobby.css';

interface TableInfo {
    id: string;
    name: string;
    playersCount: number;
    minBuyIn: number;
}

export const PokerLobby = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initConnection = async () => {
            if (connectionRef.current) return;

            const newConnection = new signalR.HubConnectionBuilder()
               // .withUrl("http://localhost:5046/pokerHub", {
            .withUrl("http://91.123.188.186:5000/pokerHub", { 
                    accessTokenFactory: () => localStorage.getItem("jwt") || ""
                })
                .withAutomaticReconnect()
                .build();

            connectionRef.current = newConnection;

            try {
                await newConnection.start();
                console.log("Poker Lobby: Połączono z SignalR");

                if (isMounted) {
                    setIsConnected(true);
                    const data = await newConnection.invoke("GetTables");
                    setTables(data);
                }
            } catch (err: any) {
                if (err.toString().includes("AbortError") || err.toString().includes("invocation canceled")) {
                    console.log("Poker Lobby: Połączenie anulowane.");
                } else {
                    console.error("Poker Lobby: Błąd połączenia:", err);
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
        navigate(`/poker/${tableId}`);
    };

    const getCardVariantClass = (tableId: string) => {
        if (tableId.includes('vip')) return 'pk-card-vip';
        if (tableId.includes('stol-2')) return 'pk-card-advanced';
        return 'pk-card-beginner';
    };

    // Sortowanie stołów: Beginner -> Advanced -> VIP
    const sortedTables = [...tables].sort((a, b) => {
        const getOrder = (id: string) => {
            if (id.includes('vip')) return 2;
            if (id.includes('stol-2')) return 1;
            return 0;
        };
        return getOrder(a.id) - getOrder(b.id);
    });

    return (
        <div className="pk-lobby-page">
            <div className="pk-lobby-bg">
                <div className="pk-lobby-shape pk-lobby-shape-1"></div>
                <div className="pk-lobby-shape pk-lobby-shape-2"></div>
                <div className="pk-lobby-shape pk-lobby-shape-3"></div>
            </div>

            <header className="pk-lobby-header">
                <button onClick={() => navigate('/poker-mode')} className="pk-lobby-back-btn">
                    <i className="fas fa-arrow-left"></i>
                    <span>Powrót</span>
                </button>
                <h1 className="pk-lobby-title">POKER ROOMS</h1>
                <div className="pk-lobby-spacer"></div>
            </header>

            <div className="pk-lobby-content">
                <p className="pk-lobby-subtitle">Wybierz stół i zacznij grać</p>

                {isConnected ? (
                    <div className="pk-tables-grid">
                        {sortedTables.map((table, index) => {
                            const variantClass = getCardVariantClass(table.id);
                            return (
                                <div 
                                    key={table.id} 
                                    className={`pk-table-card ${variantClass}`}
                                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                                >
                                    <div className="pk-card-shine"></div>
                                    <div className="pk-card-icon-bg">♠</div>
                                    
                                    <h3 className="pk-table-name">{table.name}</h3>
                                    
                                    <div className="pk-table-details">
                                        <div className="pk-detail-item">
                                            <span>👥 Gracze</span>
                                            <span className="pk-detail-value">{table.playersCount} / 6</span>
                                        </div>
                                        <div className="pk-detail-item">
                                            <span>💰 Min. wejście</span>
                                            <span className="pk-detail-value">${table.minBuyIn}</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => joinTable(table.id)} className="pk-join-btn">
                                        Zagraj Teraz
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pk-loading-container">
                        <div className="pk-loading-spinner"></div>
                        <span className="pk-loading-text">Ładowanie stołów...</span>
                    </div>
                )}
            </div>
        </div>
    );
};
