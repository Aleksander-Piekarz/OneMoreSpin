import * as signalR from "@microsoft/signalr";
import { type PokerTable } from "../types/poker";

class PokerService {
    private connection: signalR.HubConnection;

    constructor() {
        const hubUrl = "http://91.123.188.186:5000/pokerHub";

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
                console.log("SignalR Connected!");
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
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
      public async leaveTable(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("LeaveTable", tableId);
    }

    public async joinTable(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            console.warn("Nie można dołączyć - brak połączenia.");
            return;
        }
        await this.connection.invoke("JoinTable", tableId);
    }

    public async startGame(tableId: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("StartGame", tableId);
    }

    public async makeMove(tableId: string, action: string, amount: number) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("MakeMove", tableId, action, amount);
    }

    public async setReady(tableId: string, isReady: boolean) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("SetReady", tableId, isReady);
    }

    public onUpdateGameState(callback: (table: PokerTable) => void) {
        this.connection.on("UpdateGameState", callback);
    }

    public onPlayerJoined(callback: (username: string) => void) {
        this.connection.on("PlayerJoined", callback);
    }

    public onActionLog(callback: (message: string) => void) {
        this.connection.on("ActionLog", callback);
    }

    public onError(callback: (message: string) => void) {
        this.connection.on("Error", callback);
    }


    public async sendMessage(tableId: string, message: string) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        await this.connection.invoke("SendMessage", tableId, message);
    }


    public onReceiveMessage(callback: (username: string, message: string) => void) {
        this.connection.on("ReceiveMessage", callback);
    }
    
    public onKickFromTable(callback: (reason: string) => void) {
        this.connection.on("KickFromTable", callback);
    }
    
    public offEvents() {
        this.connection.off("UpdateGameState");
        this.connection.off("PlayerJoined");
        this.connection.off("ActionLog");
        this.connection.off("Error");
        this.connection.off("ReceiveMessage");
        this.connection.off("KickFromTable");
    }
}

export const pokerService = new PokerService();