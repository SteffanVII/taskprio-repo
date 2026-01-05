import WebSocket from "ws"
import { EWebSocketEventType, TCheckHealthWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";

export const checkHealthEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TCheckHealthWebSocketMessage> ) => {
    if ( payload.message.message === "ping" ) {
        const reply : TWebSocketMessage<TCheckHealthWebSocketMessage> = {
            type : EWebSocketEventType.CHECK_HEALTH,
            message : {
                message : "pong"
            }
        }
        ws.send(JSON.stringify(reply))
    }
}