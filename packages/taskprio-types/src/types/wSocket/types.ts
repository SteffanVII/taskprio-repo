import { TTask } from "../task/types"
import { EWebsocketClientEventType, EWebSocketEventType } from "./enums"

export type TWebSocketMessage<T = any> = {
    type : EWebSocketEventType | EWebsocketClientEventType,
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

// Task todo messages
export type TTaskTodoTimerHeartbeatWebSocketMesssage = {
    task_id : string,
    workspace_id : string
}

// Taskboard messages
export type TTaskboardDroppedWebSocketMessage = {
    taskboard_id : string,
    workspace_id : string
}

export type TTaskboardDeactivatedWebSocketMessage = {
    taskboard_id : string,
    workspace_id : string
}

export type TTaskboardReactivatedWebSocketMessage = {
    project_id : string
}

// Project messages
export type TProjectDeactivatedSocketMessage = {
    workspace_id : string,
    project_id : string
}

export type TProjectDroppedSocketMessage = {
    workspace_id : string,
    project_id : string
}

export type TProjectReactivatedSocketMessage = {
    workspace_id : string,
    project_id : string
}
