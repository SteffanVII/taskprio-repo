import WebSocket from "ws";
import { wsConnectionsManager } from "../../app.js";
import { TWebSocketChangePathMessageSimple, TWebSocketMessage } from "@repo/taskprio-types";

export const pathUpdateEventHandlerSimple = ( ws : WebSocket, data : TWebSocketMessage<TWebSocketChangePathMessageSimple> ) => {
    wsConnectionsManager.joinWorkspaceChannel( ws, data.data.workspace_id, data.data.previous_workspace_id );
}