import { TCheckHealthWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types/src";


export const checkHealthEventHandler = ( message : TWebSocketMessage<TCheckHealthWebSocketMessage>, sendWebSocketMessage : ( message : TWebSocketMessage ) => void ) => {
    sendWebSocketMessage(message)
}