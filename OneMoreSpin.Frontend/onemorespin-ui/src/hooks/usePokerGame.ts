import { useEffect, useState } from "react";
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
   

    useEffect(() => {
        let isMounted = true;
        
        // 1. Ustaw ID
        const id = getMyId();
        setMyUserId(id);

        // 2. Rejestruj listenery PRZED połączeniem
        pokerService.onUpdateGameState((updatedTable) => {
            if (isMounted) setTable(updatedTable);
        });

        pokerService.onPlayerJoined((username) => {
            if (isMounted) setLogs(prev => [...prev, `Gracz ${username} dołączył.`]);
        });

        pokerService.onActionLog((msg) => {
            if (isMounted) setLogs(prev => [...prev, msg]);
        });

        pokerService.onReceiveMessage((username, text) => {
            if (isMounted) {
                setChatMessages(prev => [...prev, { username, text }]);
            }
        });

        const connectAndJoin = async () => {
            try {
                console.log("Hook: Próba startConnection()...");
                // To wywołanie teraz bezpiecznie poczeka, jeśli połączenie już trwa
                await pokerService.startConnection();
                
                if (isMounted) {
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
            pokerService.offEvents();
        };
    }, [tableId]);

    const startGame = async () => {
        if (!isConnected) return;
        await pokerService.startGame(tableId);
    };

    const move = async (action: string, amount: number) => {
        if (!isConnected) return;
        await pokerService.makeMove(tableId, action, amount);
    };
    const sendChatMessage = async (msg: string) => {
            if (!isConnected) return;
            await pokerService.sendMessage(tableId, msg);
        };
    return { table, logs, isConnected, startGame, move, myUserId, chatMessages, sendChatMessage };
};