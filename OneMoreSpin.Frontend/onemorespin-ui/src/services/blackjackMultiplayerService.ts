// src/services/blackjackMultiplayerService.ts
import * as signalR from "@microsoft/signalr";
import { type BlackjackTable } from "../types/blackjack";

class BlackjackMultiplayerService {
    private connection: signalR.HubConnection;

    constructor() {
        const hubUrl = "http://91.123.188.186:5000/blackjackHub";  
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => {
                    return localStorage.getItem("jwt") || "";
                }
            })
            .withAutomaticReconnect()
            .build();
    }

    public async startConnection() {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            try {
                await this.connection.start();
                console.log("Blackjack SignalR Connected!");
            } catch (err) {
                console.error("Blackjack SignalR Connection Error: ", err);
                return;
            }
        }

        while ((this.connection.state as signalR.HubConnectionState) !== signalR.HubConnectionState.Connected) {
            await new Promise(resolve => setTimeout(resolve, 50));

            if (this.connection.state === signalR.HubConnectionState.Disconnected) {
                break;
            }
        }
    }

    public async stopConnection() {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.stop();
        }
    }

    // --- Metody ---

    public async joinTable(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            console.warn("Nie można dołączyć - brak połączenia.");
            return;
        }
        await this.connection.invoke("JoinTable", tableId);
    }

    public async placeBet(tableId: string, amount: number) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("PlaceBet", tableId, amount);
    }

    public async startRound(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("StartRound", tableId);
    }

    public async hit(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("Hit", tableId);
    }

    public async stand(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("Stand", tableId);
    }

    public async double(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("Double", tableId);
    }

    public async sendMessage(tableId: string, message: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("SendMessage", tableId, message);
    }

    // --- Listenery ---

    public onUpdateGameState(callback: (table: BlackjackTable) => void) {
        this.connection.on("UpdateGameState", callback);
    }

    public onPlayerJoined(callback: (username: string) => void) {
        this.connection.on("PlayerJoined", callback);
    }

    public onPlayerLeft(callback: (username: string) => void) {
        this.connection.on("PlayerLeft", callback);
    }

    public onActionLog(callback: (message: string) => void) {
        this.connection.on("ActionLog", callback);
    }

    public onError(callback: (message: string) => void) {
        this.connection.on("Error", callback);
    }

    public onReceiveMessage(callback: (username: string, message: string) => void) {
        this.connection.on("ReceiveMessage", callback);
    }

    public offEvents() {
        this.connection.off("UpdateGameState");
        this.connection.off("PlayerJoined");
        this.connection.off("PlayerLeft");
        this.connection.off("ActionLog");
        this.connection.off("Error");
        this.connection.off("ReceiveMessage");
    }
}

export const blackjackMultiplayerService = new BlackjackMultiplayerService();
