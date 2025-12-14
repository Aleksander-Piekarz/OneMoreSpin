import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initConnection = async () => {
            if (connectionRef.current) return;

            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://91.123.188.186:5000/pokerHub", {
                    accessTokenFactory: () => localStorage.getItem("jwt") || ""
                })
                .withAutomaticReconnect()
                .build();

            connectionRef.current = newConnection;

            try {
                await newConnection.start();
                console.log("Lobby: Połączono z SignalR");
                
                if (isMounted) {
                    setIsConnected(true);
                    const data = await newConnection.invoke("GetTables");
                    setTables(data);
                }
            } catch (err: any) {
                if (err.toString().includes("AbortError") || err.toString().includes("invocation canceled")) {
                    console.log("Lobby: Połączenie anulowane (normalne przy przeładowaniu).");
                } else {
                    console.error("Lobby: Błąd połączenia:", err);
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
        if (tableId.includes('vip')) return 'card-vip';
        if (tableId.includes('stol-2')) return 'card-advanced';
        return 'card-beginner';
    };

    return (
        <div className="lobby-container">
            <header className="lobby-header">
                <button onClick={() => navigate('/')} className="back-btn">
                    <span>←</span> STRONA GŁÓWNA
                </button>
                <h1 className="lobby-title">POKER ROOMS</h1>
                <div style={{width: '140px'}}></div> 
            </header>

            {isConnected ? (
                <div className="tables-grid">
                    {tables.map(table => {
                        const variantClass = getCardVariantClass(table.id);
                        return (
                            <div key={table.id} className={`lobby-card ${variantClass}`}>
                                <div className="card-icon-bg">♠</div>
                                <div>
                                    <h3 className="table-name">{table.name}</h3>
                                    <div className="table-details">
                                        <div className="detail-item">
                                            <span>👥 Gracze:</span>
                                            <strong>{table.playersCount} / 6</strong>
                                        </div>
                                        {/* <div className="detail-item">
                                            <span>💰 Buy-in:</span>
                                            <span className="buy-in-highlight">${table.minBuyIn}</span>
                                        </div> */}

                                    </div>
                                </div>
                                <button onClick={() => joinTable(table.id)} className="join-btn">
                                    ZAGRAJ TERAZ
                                </button>
                                
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="loading-container">
                    ⌛ Ładowanie stołów...
                </div>
            )}
        </div>
    );
};