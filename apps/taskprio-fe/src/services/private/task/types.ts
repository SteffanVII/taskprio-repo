import { TAddTaskAssigneeRequestBody, TAddTaskCommentRequestBody, TAddTaskCommentRequestPathParams, TGetTaskCommentsRequestPathParams, TMoveTaskToTrashRequestParams, TRemoveTaskTagRequestBody, TRestoreTaskFromTrashRequestParams, TTask, TTaskAssignee, TTaskTimeLog } from "@repo/taskprio-types/src";

// Query
export type TGetTaskResponse = TTask

export type TGetTaskCommentsPayload = {
    pathParameter : Partial<TGetTaskCommentsRequestPathParams>
}
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
    optimisticData? : TTaskAssignee,
    body : TAddTaskAssigneeRequestBody
}

export type TRemoveTaskAssigneePayload = Omit<TAddTaskAssigneePayload, "optimisticData">

export type TAddTaskTimeLogPayload = {
    task_id : string,
    body : {
        time_spent : number
    }
}

export type TAddTaskTimeLogResponse = TTaskTimeLog;

export type TAddTaskTagPayload = {
    body : {
        tag_id : string,
        task_id : string
    }
}

export type TRemoveTaskTagPayload = {
    body : TRemoveTaskTagRequestBody
}

export type TAddTaskCommentPayload = {
    pathParameter : TAddTaskCommentRequestPathParams,
    body : TAddTaskCommentRequestBody
}

export type TMoveTaskToTrashPayload = {
    params : TMoveTaskToTrashRequestParams
}

export type TRestoreTaskFromTrashPayload = {
    params : TRestoreTaskFromTrashRequestParams
}

// Task

// export type TTaskForCardView = {
//     task_id : string,
//     task_section_id : string,
//     task_title : string,
//     task_description : string | null,
//     task_estimate : number | null,
//     task_deadline : string | null,
//     display_order : number,
//     assignees : TTaskAssignee[]
// }

// export type TTask = {
//     task_id : string,
//     task_section_id : string,
//     task_title : string,
//     task_description : string | null,
//     task_estimate : number | null,
//     task_deadline : string | null,
//     created_by : string,
//     created_at : string,
//     last_modified : string,
//     display_order : number,
//     assignees : TTaskAssignee[],
//     task_time_logs : TTaskTimeLog[]
// }

// export type TTaskAssignee = {
//     user_id : string,
//     firstname : string,
//     lastname : string
// }

// export type TTaskTimeLog = {
//     task_id : string,
//     user_id : string,
//     time_spent : number,
//     created_at : string
// } 