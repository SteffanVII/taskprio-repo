import dotenv from "dotenv"
import { store } from "src/lib/store";
import { v4 as uuidv4 } from "uuid"
import { EWebsocketClientEventType, TWebSocketMessage } from "@repo/taskprio-types";
import { mainWindow } from "../main";
import { EEventListeners } from "src/lib/enums";
import { WebSocket } from "ws";

dotenv.config()

class WebsocketManager {

    public websocket: WebSocket | null;
    private checkHealthTimerWorkerInterval: ReturnType<typeof setInterval> | null;

    private createHealthCheckTimer() {
        if (!!this.checkHealthTimerWorkerInterval) {
            clearInterval(this.checkHealthTimerWorkerInterval)
        }

        const sendMessage = () => {
            if (!!this.websocket) return;
            this.websocket.send(JSON.stringify({
                type: EWebsocketClientEventType.CHECK_HEALTH,
                message: {
                    message: "ping"
                }
            }))
        }

        this.checkHealthTimerWorkerInterval = setInterval(sendMessage, 60000)
    }

    private removeHealthCheckTimer() {
        if (!!this.checkHealthTimerWorkerInterval) {
            clearInterval(this.checkHealthTimerWorkerInterval)
            this.checkHealthTimerWorkerInterval = null
        }
    }

    private handleMessage() {
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data.toString()) as TWebSocketMessage;
            mainWindow.webContents.send(EEventListeners.WEBSOCKET_ONMESSAGE, data)
        }
    }

    createConnection(accessToken: string) {
        let clientId = store.get("clientId")
        if (!!clientId) {
            const newId = uuidv4()
            store.set("clientId", newId)
            clientId = newId
        }
        if (this.websocket) {
            this.websocket.close()
            this.websocket = null;
        }
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, "Creating connection")
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, clientId)
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, accessToken)
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, process.env.SERVER_WS_URL)
        this.websocket = new WebSocket(
            `${process.env.SERVER_WS_URL}?connection_type=electron&client_id=${clientId}&access_token=${accessToken}`
        )
        mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 0)
        this.websocket.onopen = () => {
            this.createHealthCheckTimer()
            this.handleMessage()
            mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 1)
        }
        this.websocket.onclose = () => {
            this.removeHealthCheckTimer()
            mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 3)
        }
        this.websocket.onerror = ( error ) => {
            console.log(error)
            mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 3)
            this.removeHealthCheckTimer()
            setTimeout(() => {
                mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 0)
                this.createConnection(accessToken)
            }, 3000)
        }
    }

    closeConnection() {
        if ( this.websocket ) {
            this.removeHealthCheckTimer()
            mainWindow.webContents.send(EEventListeners.WEBSOCKET_CONNECTION_STATE, 2)
            this.websocket.close()
            this.websocket = null
        }
    }

}

export const websocketManager = new WebsocketManager()