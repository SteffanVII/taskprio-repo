import { TTask } from "../routes/task/types.js"
import { EWebSocketEventType } from "./enums.js"

export type TWebSocketMessage<T = any> = {
    type : EWebSocketEventType,
    data : T,
}

export type TWebSocketChangePathMessage = {
    previous_path : {
        workspace_id? : string,
        project_id? : string,
        board_id? : string,
    }
    workspace_id : string,
    project_id? : string,
    board_id? : string
}

export type TConnectedClientPath = {
    workspace_id : string,
    project_id? : string,
    board_id? : string
}

export type TTaskCreateWebSocketMessage = {
    task : TTask,
    path : TConnectedClientPath
}

export type TTaskUpdateWebSocketMessage = {
    task : TTask,
    path : TConnectedClientPath
}