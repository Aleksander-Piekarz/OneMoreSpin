import { useEffect, useState, useRef } from "react";
import { pokerService } from "../services/pokerService";
import { type PokerTable } from "../types/poker";

export interface ChatMessage {
    username: string;
    text: string;
}
const getMyId = () => {
    try {
        const token = localStorage.getItem("jwt");
        if (!token) return "";
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const parsed = JSON.parse(jsonPayload);
        
        return parsed.sub || 
               parsed.nameid || 
               parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
               "";
    } catch (e) {
        return "";
    }
};

export const usePokerGame = (tableId: string) => {
    const [table, setTable] = useState<PokerTable | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [myUserId, setMyUserId] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [kickReason, setKickReason] = useState<string | null>(null);
    const hasLeftRef = useRef(false);
   

    useEffect(() => {
        let isMounted = true;
        hasLeftRef.current = false;
        
        const id = getMyId();
        setMyUserId(id);

        pokerService.onUpdateGameState((updatedTable) => {
            if (isMounted) {
                console.log("[POKER] Otrzymano stan stołu:", updatedTable);
                console.log("[POKER] Gracze:", updatedTable.players.map(p => ({
                    username: p.username,
                    isVip: p.isVip,
                    chips: p.chips
                })));
                setTable(updatedTable);
            }
        });

        pokerService.onPlayerJoined((username) => {
            if (isMounted) setLogs(prev => [...prev, `Gracz ${username.split('@')[0]} dołączył.`]);
        });

        pokerService.onActionLog((msg) => {
            if (isMounted) setLogs(prev => [...prev, msg]);
        });

        pokerService.onReceiveMessage((username, text) => {
            if (isMounted) {
                setChatMessages(prev => [...prev, { username, text }]);
            }
        });

        pokerService.onKickFromTable((reason) => {
            if (isMounted) {
                console.log("[POKER] Kicked from table:", reason);
                setKickReason(reason);
            }
        });

        const connectAndJoin = async () => {
            try {
                console.log("Hook: Próba startConnection()...");
                await pokerService.startConnection();
                
                if (isMounted && !hasLeftRef.current) {
                    console.log("Hook: Połączono! Ustawiam stan isConnected.");
                    setIsConnected(true);
                    
                    console.log(`Hook: Dołączam do stołu ${tableId}...`);
                    await pokerService.joinTable(tableId);
                }
            } catch (err) {
                console.error("Hook: Błąd krytyczny:", err);
            }
        };

        connectAndJoin();

        return () => {
            isMounted = false;
            if (!hasLeftRef.current) {
                pokerService.leaveTable(tableId).catch(console.error);
            }
            pokerService.offEvents();
        };
    }, [tableId]);

    const leaveTable = async () => {
        if (!isConnected || hasLeftRef.current) return;
        hasLeftRef.current = true; // Mark that we're leaving to prevent double leave
        try {
            await pokerService.leaveTable(tableId);
        } catch (e) {
            console.error("Error in leaveTable:", e);
        }
    };

    const startGame = async () => {
        if (!isConnected) return;
        await pokerService.startGame(tableId);
    };

    const move = async (action: string, amount: number) => {
        if (!isConnected) return;
        await pokerService.makeMove(tableId, action, amount);
    };

    const setReady = async (isReady: boolean) => {
        if (!isConnected) return;
        await pokerService.setReady(tableId, isReady);
    };

    const sendChatMessage = async (msg: string) => {
            if (!isConnected) return;
            await pokerService.sendMessage(tableId, msg);
        };
    return { table, logs, isConnected, startGame, move, myUserId, chatMessages, sendChatMessage, leaveTable, kickReason, setReady };
};