import { ipcRenderer } from "electron";
import { EEventListeners, EEvents } from "src/lib/enums";
import { TWebSocketMessage } from "@repo/taskprio-types"


export const websocketAPI = {

    initializeWebsocket : () => ipcRenderer.send( EEvents.INITIALIZE_WEBSOCKET ),
    closeWebsocket : () => ipcRenderer.send( EEvents.CLOSE_WEBSOCKET ),
    sendWebsocketMessage : ( message : TWebSocketMessage ) => ipcRenderer.send( EEvents.SEND_WEBSOCKET_MESSAGE, message ),

    // Listeners
    onWebsocketConnectionState : (
        callback : ( value : string ) => void
    ) => {
        ipcRenderer.removeAllListeners( EEventListeners.WEBSOCKET_CONNECTION_STATE )
        ipcRenderer.on( EEventListeners.WEBSOCKET_CONNECTION_STATE, (_, value) =>  callback(value))
    },

    onPingServer : (
        callback : () => void
    ) => {
        ipcRenderer.removeAllListeners( EEventListeners.ON_PING_SERVER )
        ipcRenderer.on( EEventListeners.ON_PING_SERVER, () => callback() )
    },

    onWebsocketMessage : (
        callback : ( message : TWebSocketMessage ) => void
    ) => {
        ipcRenderer.removeAllListeners( EEventListeners.WEBSOCKET_ONMESSAGE )
        ipcRenderer.on( EEventListeners.WEBSOCKET_ONMESSAGE, (_, message) => callback(message) )
    }
    
}