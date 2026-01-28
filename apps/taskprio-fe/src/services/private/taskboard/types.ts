import { TGetTaskboardTrashTasksRequestParams, TTaskboard } from "@repo/taskprio-types"

export type TGetProjectTaskboardsPayload = {
    query: {
        project_id?: string
    }
}

export type TGetProjectTaskboardsResponse = TTaskboard[]

export type TGetTaskboardTrashTasksPayload = {
    params: Partial<TGetTaskboardTrashTasksRequestParams>
}

// Taskboard

// export type TTaskboard = {
//     task_board_id : string,
//     task_board_name : string,
//     task_board_slug : string,
//     task_board_created_at : string,
// }