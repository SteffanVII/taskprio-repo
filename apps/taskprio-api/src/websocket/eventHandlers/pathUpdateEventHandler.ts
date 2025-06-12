import WebSocket from "ws";
import { wsConnectionsManager } from "../../app.js";
import { TWebSocketChangePathMessage, TWebSocketMessage } from "../types.js";

export const pathUpdateEventHandler = ( ws : WebSocket, data : TWebSocketMessage<TWebSocketChangePathMessage> ) => {
    wsConnectionsManager.updateConnectionPath( data.data, ws );
}