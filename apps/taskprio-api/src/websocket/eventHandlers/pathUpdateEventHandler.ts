import WebSocket from "ws";
import { wsConnectionsManagerSimple } from "../../app.js";
import { TWebSocketChangePathMessageSimple, TWebSocketMessage } from "@repo/taskprio-types";

// export const pathUpdateEventHandler = ( ws : WebSocket, data : TWebSocketMessage<TWebSocketChangePathMessage> ) => {
//     wsConnectionsManager.updateConnectionPath( data.data, ws );
// }

export const pathUpdateEventHandlerSimple = ( ws : WebSocket, data : TWebSocketMessage<TWebSocketChangePathMessageSimple> ) => {
    wsConnectionsManagerSimple.switchWorkspace( ws, data.data.workspace_id, data.data.previous_workspace_id );
}