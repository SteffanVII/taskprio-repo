import WebSocket from "ws"
import { EWebSocketEventType, TCheckHealthWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";

export const checkHealthEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TCheckHealthWebSocketMessage> ) => {
    if ( message.data.message === "ping" ) {
        const reply : TWebSocketMessage<TCheckHealthWebSocketMessage> = {
            type : EWebSocketEventType.CHECK_HEALTH,
            data : {
                message : "pong"
            }
        }
        ws.send(JSON.stringify(reply))
    }
}