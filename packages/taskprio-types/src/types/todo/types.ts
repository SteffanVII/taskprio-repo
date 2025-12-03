import { Selectable } from "kysely"
import { TTask } from "../task/types"
import { ProjectProject, TaskboardTaskTodoState, TaskboardTaskTodoTimer } from "../../db"
import { TTaskTag } from "../tag/types"

// Mutation
export type TAddTaskToTodoRequestPathParams = {
    task_id : string
}

export type TAddTaskToTodoRequestBody = {
    display_order? : number
}

export type TUpdateTaskTodoStateRequestPathParams = {
    task_id : string
}

export type TUpdateTaskTodoStateRequestBody = {
    display_order? : number,
    active? : boolean,
    current_work_time? : number,
    work_time_goal? : number
}

export type TRemoveTaskFromTodoRequestPathParams = {
    task_id : string
}

export type TFinishTaskTodoSessionRequestPathParams = {
    workspace_id : string
}

export type TStartOrStopTaskTodoTimerRequestPathParams = {
    task_id : string
}

export type TStartOrStopTaskTodoTimerResponseData = TTaskTodoTimer;

// Query
export type TGetTaskAssignedToUserByWorkspaceRequestPathParams = {
    workspace_id : string
}

export type TGetTaskAssignedToUserByWorkspaceResponseData = TUserAvailableTaskTodoByProject[]

export type TGetUserTaskTodoStateRequestPathParams = {
    workspace_id : string
}

export type TGetUserTaskTodoStateResponseData = TUserTaskTodoState[]

// Task Todo

export type TTaskTodoTimer = Selectable<TaskboardTaskTodoTimer>

export type TUserAvailableTaskTodoByProject = Pick<Selectable<ProjectProject>, "project_id" | "created_by" | "workspace_id" | "project_name" | "project_abbreviation" | "project_color"> & {
    tasks : (TUserTaskTodoState | TUserAvailableTaskTodo)[]
}

export type TUserAvailableTaskTodo = {
    tags : TTaskTag[]
} & Pick<TTask, "project_abbreviation" | "project_color" | "task_id" | "task_title" | "task_deadline" | "task_depth">

export type TUserTaskTodoState = TUserAvailableTaskTodo & Pick<Selectable<TaskboardTaskTodoState>, "work_time_goal" | "current_work_time" | "display_order" | "active"> & {
    timers : TTaskTodoTimer[]
}