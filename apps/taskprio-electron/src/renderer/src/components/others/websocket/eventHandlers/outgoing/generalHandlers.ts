import { TCheckHealthWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";


export const checkHealthEventHandler = (message: TWebSocketMessage<TCheckHealthWebSocketMessage>, sendWebSocketMessage: (message: TWebSocketMessage) => void) => {
    sendWebSocketMessage(message)
}