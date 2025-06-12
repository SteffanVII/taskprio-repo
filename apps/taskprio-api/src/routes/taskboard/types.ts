

export type TGetProjectTaskboardListRequestQuery = {
    project_id : string
}

// Taskboard

export type TTaskboard = {
    task_board_id : string;
    task_board_name : string;
    task_board_slug : string;
    created_at : string;
}
