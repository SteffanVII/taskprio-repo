
// Query
export type TGetTaskResponse = TTask

// Mutation

export type TCreateTaskPayload = {
    body : {
        task_board_id : string,
        task_section_id : string,
        task_title : string
    }
}

export type TCreateTaskResponse = TTask;

export type TArrangeTaskPayload = {
    task_id : string,
    body : {
        task_section_id : string,
        display_order : number
    }
}

export type TUpdateTaskPrimitiveFieldsPayload = {
    task_id : string,
    body : {
        task_title? : string,
        task_description? : string | null,
        task_estimate? : number | null,
        task_deadline? : string | null
    }
}

export type TArrangeTaskResponse = TTask;

export type TAddTaskAssigneePayload = {
    task_id : string,
    body : {
        user_id : string
    }
}

export type TRemoveTaskAssigneePayload = TAddTaskAssigneePayload

export type TAddTaskTimeLogPayload = {
    task_id : string,
    body : {
        time_spent : number
    }
}

export type TAddTaskTimeLogResponse = TTaskTimeLog;

// Task

export type TTaskForCardView = {
    task_id : string,
    task_section_id : string,
    task_title : string,
    task_description : string | null,
    task_estimate : number | null,
    task_deadline : string | null,
    display_order : number,
    assignees : TTaskAssignee[]
}

export type TTask = {
    task_id : string,
    task_section_id : string,
    task_title : string,
    task_description : string | null,
    task_estimate : number | null,
    task_deadline : string | null,
    created_by : string,
    created_at : string,
    last_modified : string,
    display_order : number,
    assignees : TTaskAssignee[],
    task_time_logs : TTaskTimeLog[]
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