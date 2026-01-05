// Mutation

import { Selectable } from "kysely"
import { TaskboardTask, TaskboardTaskAssignee, TaskboardTaskComment, TaskboardTaskTimeLog } from "../../db"
import { TUser } from "../user/types"
import { TTaskTag } from "../tag/types"

export type TCreateTaskRequestBody = {
    task_board_id : string,
    task_section_id : string,
    task_title : string
}

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

export type TAddTaskTagResponse = TTaskTag

export type TRemoveTaskTagRequestBody = {
    tag_id : string,
    task_id : string
}

export type TAddTaskAssigneeRequestBody = {
    taskboard_id : string,
    task_id : string,
    user_id : string
}

export type TAddTaskCommentRequestPathParams = {
    task_id : string
}

export type TAddTaskCommentRequestBody = {
    comment_content : string,
    replying_to_task_comment_id? : string
}

export type TAddTaskCommentResponseData = TTaskComment

export type TGetTaskCommentsRequestPathParams = {
    task_id : string
}

export type TGetTaskCommentsResponse = TTaskComment[]

export type TMoveTaskToTrashRequestParams = {
    task_id : string
}

export type TRestoreTaskFromTrashRequestParams = {
    task_id : string,
    taskboard_id : string
}

// Task

export type TTask = Selectable<TaskboardTask> & {
    project_abbreviation : string,
    project_color : string,
    assignees : TTaskAssignee[],
    task_time_logs : TTaskTimeLog[],
    tags : TTaskTag[]
}

export type TTaskPrimitive = Omit<TTask, "assignees" | "task_time_logs" | "tags">

export type TTaskForCardView = Pick<
    TTask,
    "task_id" |
    "task_section_id" |
    "task_title" |
    "task_description" |
    "task_estimate" |
    "task_deadline" |
    "display_order" |
    "created_at" |
    "created_by" |
    "assignees" |
    "tags" |
    "project_abbreviation" |
    "project_color" |
    "task_depth" |
    "task_board_id"
>

export type TTaskPath = {
    workspace_id : string,
    project_id : string,
    task_board_id : string,
    task_section_id : string
}

export type TTaskAssignee = Omit<Selectable<TaskboardTaskAssignee>, "task_id"> & Pick<TUser, "firstname" | "lastname">;

export type TTaskTimeLog = Selectable<TaskboardTaskTimeLog>

export type TTaskComment = Pick<Selectable<TaskboardTaskComment>, "task_comment_id" | "comment_content" | "created_at" | "edited_at"> & {
    user : Pick<TUser, "firstname" | "lastname" | "email"> | null,
    replying_to_task_comment : Pick<TTaskComment, "task_comment_id" | "comment_content" | "created_at" | "edited_at" | "user"> | null
}