import { TTaskTodoTimerHeartbeatWebSocketMesssage, TWebSocketMessage } from "@repo/taskprio-types/src";

export const taskTodoTimerHeartbeatEventHandler = ( message : TWebSocketMessage<TTaskTodoTimerHeartbeatWebSocketMesssage>, sendWebSocketMessage : ( message : TWebSocketMessage ) => void ) => {
    sendWebSocketMessage(message)
}