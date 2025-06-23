// Mutation

export type TArrangeTaskRequestBody = {
    task_section_id : string,
    display_order : number
}

export type TUpdateTaskPrimitiveFieldsRequestBody = {
    task_title? : string,
    task_description? : string | null,
    task_estimate? : number | null,
    task_deadline? : string | null
}

// Task

export type TTask = {
    task_id : string,
    task_section_id : string,
    task_title : string,
    task_description : string | null,
    task_estimate : number | null,
    task_deadline : string | null,
    display_order : number,
    created_by : string,
    created_at : string,
    last_modified : string,
    assignees : TTaskAssignee[],
    task_time_logs : TTaskTimeLog[]
}

export type TTaskForCardView = Pick<
    TTask,
    "task_id" |
    "task_section_id" |
    "task_title" |
    "task_description" |
    "task_estimate" |
    "task_deadline" |
    "display_order" |
    "assignees"
>

export type TTaskPath = {
    workspace_id : string,
    project_id : string,
    task_board_id : string,
    task_section_id : string
}

export type TTaskAssignee = {
    user_id : string,
    firstname : string,
    lastname : string
}

export type TTaskTimeLog = {
    task_id : string,
    user_id : string,
    time_spent : number,
    created_at : string
}