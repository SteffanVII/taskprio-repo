
export type TGetProjectTaskboardsPayload = {
    query : {
        project_id? : string
    }
}

export type TGetProjectTaskboardsResponse = TTaskboard[]

// Taskboard

export type TTaskboard = {
    task_board_id : string,
    task_board_name : string,
    task_board_slug : string,
    task_board_created_at : string,
}