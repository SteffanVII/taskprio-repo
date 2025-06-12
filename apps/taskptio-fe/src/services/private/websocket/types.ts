import { EWebSocketEventType } from "./enums"

export type TWebSocketMessage<T = any> = {
    type : EWebSocketEventType,
    data : T
}

export type TWebSocketMessagePathChange = {
    previous_path : {
        workspace_id? : string,
        project_id? : string,
        board_id? : string
    },
    workspace_id : string,
    project_id? : string,
    board_id? : string
}