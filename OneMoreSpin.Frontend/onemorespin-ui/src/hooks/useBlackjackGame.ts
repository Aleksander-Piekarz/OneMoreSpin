import { useEffect, useState, useRef } from "react";
import { blackjackMultiplayerService } from "../services/blackjackMultiplayerService";
import { type BlackjackTable } from "../types/blackjack";

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
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
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

export const useBlackjackGame = (tableId: string) => {
    const [table, setTable] = useState<BlackjackTable | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [myUserId, setMyUserId] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const hasLeftRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        hasLeftRef.current = false;

        const id = getMyId();
        setMyUserId(id);

        blackjackMultiplayerService.onUpdateGameState((updatedTable) => {
            if (isMounted) setTable(updatedTable);
        });

        blackjackMultiplayerService.onPlayerJoined((username) => {
            if (isMounted) setLogs(prev => [...prev, `Gracz ${username.split('@')[0]} dołączył.`]);
        });

        blackjackMultiplayerService.onPlayerLeft((username) => {
            if (isMounted) setLogs(prev => [...prev, `Gracz ${username.split('@')[0]} opuścił stół.`]);
        });

        blackjackMultiplayerService.onActionLog((msg) => {
            if (isMounted) setLogs(prev => [...prev, msg]);
        });

        blackjackMultiplayerService.onError((msg) => {
            if (isMounted) setLogs(prev => [...prev, `❌ ${msg}`]);
        });

        blackjackMultiplayerService.onReceiveMessage((username, text) => {
            if (isMounted) {
                setChatMessages(prev => [...prev, { username, text }]);
            }
        });

        const connectAndJoin = async () => {
            try {
                console.log("Blackjack Hook: Próba startConnection()...");
                await blackjackMultiplayerService.startConnection();

                if (isMounted) {
                    console.log("Blackjack Hook: Połączono!");
                    setIsConnected(true);

                    console.log(`Blackjack Hook: Dołączam do stołu ${tableId}...`);
                    await blackjackMultiplayerService.joinTable(tableId);
                }
            } catch (err) {
                console.error("Blackjack Hook: Błąd krytyczny:", err);
            }
        };

        connectAndJoin();

        return () => {
            isMounted = false;
            if (!hasLeftRef.current) {
                blackjackMultiplayerService.leaveTable(tableId).catch(console.error);
            }
            blackjackMultiplayerService.offEvents();
        };
    }, [tableId]);

    const placeBet = async (amount: number) => {
        if (!isConnected) return;
        await blackjackMultiplayerService.placeBet(tableId, amount);
    };

    const startRound = async () => {
        if (!isConnected) return;
        await blackjackMultiplayerService.startRound(tableId);
    };

    const hit = async () => {
        if (!isConnected) return;
        await blackjackMultiplayerService.hit(tableId);
    };

    const stand = async () => {
        if (!isConnected) return;
        await blackjackMultiplayerService.stand(tableId);
    };

    const double = async () => {
        if (!isConnected) return;
        await blackjackMultiplayerService.double(tableId);
    };

    const sendChatMessage = async (msg: string) => {
        if (!isConnected) return;
        await blackjackMultiplayerService.sendMessage(tableId, msg);
    };

    const leaveTable = async () => {
        if (!isConnected || hasLeftRef.current) return;
        hasLeftRef.current = true;
        try {
            await blackjackMultiplayerService.leaveTable(tableId);
        } catch (e) {
            console.error("Error in leaveTable:", e);
        }
    };

    return {
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
        sendChatMessage,
        leaveTable
    };
};
