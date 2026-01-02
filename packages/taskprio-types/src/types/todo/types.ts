import { Selectable } from "kysely"
import { TTask } from "../task/types"
import { ProjectProject, TaskboardTaskTodoSessionHistory, TaskboardTaskTodoState, TaskboardTaskTodoStateSnapshot, TaskboardTaskTodoStateSnapshotTimer, TaskboardTaskTodoTimer } from "../../db"
import { TTaskTag } from "../tag/types"
import { TTaskboard } from "../taskboard/types"
import { TProject } from "../project/types"

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

export type TCommitTaskTodoRequestPathParams = {
    task_id : string
}

export type TCompleteTaskTodoRequestPathParams = {
    task_id : string
}

export type TCompleteTaskTodoRequestBody = {
    completed : boolean
}

// Query
export type TGetAvailableTasksByWorkspaceRequestPathParams = {
    workspace_id : string
}

export type TGetAvailableTasksByWorkspaceResponseData = TUserAvailableTaskTodoByProject[]

export type TGetUserTaskTodoStateRequestPathParams = {
    workspace_id : string
}

export type TGetUserTaskTodoStateResponseData = TUserTaskTodoState[]

export type TGetAvailableTasksByProjectRequestPathParams = {
    project_id : string
}

export type TGetAvailableTasksByProjectRequestQuery = {
    search : string,
    taskboards : string[]
}

export type TGetAvailableTasksByProjectResponseData = TUserAvailableTaskTodoByProject;

export type TGetWorkspaceSessionHistoriesRequestQuery = {
    workspace_id : string,
    user_ids? : string[],
    date_range? : string[]
}

export type TGetWorkspaceSessionHistoriesResponseData = TSessionHistoryWithTaskTodoStateSnapshots[]

// Task Todo

export type TTaskTodoTimer = Selectable<TaskboardTaskTodoTimer>

export type TUserAvailableTaskTodoByProject = Pick<
    Selectable<ProjectProject>,
    "project_id" |
    "created_by" |
    "workspace_id" |
    "project_name" |
    "project_abbreviation" |
    "project_color"
> & {
    tasks : (TUserTaskTodoState | TUserAvailableTaskTodo)[]
}

export type TUserAvailableTaskTodo = {
    tags : TTaskTag[]
} & Pick<
    TTask,
    "project_abbreviation" |
    "project_color" |
    "task_id" |
    "task_title" |
    "task_deadline" |
    "task_depth"
> & Pick<TProject, "project_id">

export type TUserTaskTodoState = TUserAvailableTaskTodo & Pick<
    Selectable<TaskboardTaskTodoState>,
    "work_time_goal" |
    "current_work_time" |
    "display_order" |
    "active" |
    "completed"
> & {
    timers : TTaskTodoTimer[]
}

export type TSessionHistory = Selectable<TaskboardTaskTodoSessionHistory>

export type TSessionHistoryWithTaskTodoStateSnapshots = TSessionHistory & {
    snapshots : TTaskTodoStateSnapshotWithTimers[]
}

export type TTaskTodoStateSnapshot = Selectable<TaskboardTaskTodoStateSnapshot>

export type TTaskTodoStateSnapshotWithTimers = TTaskTodoStateSnapshot & {
    timers : TTaskTodoStateSnapshotTimer[]
}

export type TTaskTodoStateSnapshotTimer = Selectable<TaskboardTaskTodoStateSnapshotTimer>