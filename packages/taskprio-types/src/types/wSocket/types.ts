import { TTask } from "../task/types"
import { EWebSocketEventType } from "./enums"

export type TWebSocketMessage<T = any> = {
    type : EWebSocketEventType,
    data : T,
}

export type TWebSocketChangePathMessageSimple = {
    previous_workspace_id? : string,
    workspace_id : string
}

// Task messages
export type TTaskCreateWebSocketMessageSimple = {
    data : TTask,
    workspace_id : string
}

export type TTaskUpdateWebSocketMessageSimple = {
    data : TTask,
    workspace_id : string
}

