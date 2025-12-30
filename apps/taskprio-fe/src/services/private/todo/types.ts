import { TAddTaskToTodoRequestBody, TAddTaskToTodoRequestPathParams, TCommitTaskTodoRequestPathParams, TCompleteTaskTodoRequestBody, TCompleteTaskTodoRequestPathParams, TFinishTaskTodoSessionRequestPathParams, TGetAvailableTasksByWorkspaceRequestPathParams, TGetUserTaskTodoStateRequestPathParams, TGetWorkspaceSessionHistoriesRequestQuery, TRemoveTaskFromTodoRequestPathParams, TStartOrStopTaskTodoTimerRequestPathParams, TUpdateTaskTodoStateRequestBody, TUpdateTaskTodoStateRequestPathParams, TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types/src"

// Mutation

export type TMoveTaskToTodoPayload = {
    pathParameters : TAddTaskToTodoRequestPathParams,
    body : TAddTaskToTodoRequestBody,
    optimisticHelpers? : {
        task : TUserTaskTodoState | TUserAvailableTaskTodo,
    }
}

export type TUpdateTaskTodoStatePayload = {
    pathParameters : TUpdateTaskTodoStateRequestPathParams,
    body : TUpdateTaskTodoStateRequestBody
}

export type TRemoveTaskFromTodoPayload = {
    pathParameters : TRemoveTaskFromTodoRequestPathParams,
    optimisticHelpers? : {
        task : TUserTaskTodoState
    }
}

export type TFinishTaskTodoSessionPayload = {
    pathParameters : TFinishTaskTodoSessionRequestPathParams
}

export type TStartOrStopTaskTodoTimerPayload = {
    pathParameters : TStartOrStopTaskTodoTimerRequestPathParams
}

export type TCommitTaskTodoPayload = {
    pathParameters : TCommitTaskTodoRequestPathParams,
    optimisticHelpers? : {
        task : TUserTaskTodoState
    }
}

export type TCompleteTaskTodoPayload = {
    pathParameters : TCompleteTaskTodoRequestPathParams,
    body : TCompleteTaskTodoRequestBody
}

// Query

export type TGetTasksAssignedToUserByWorkspacePayload = {
    pathParameter : Partial<TGetAvailableTasksByWorkspaceRequestPathParams>
}

export type TGetUserTaskTodoStatePayload = {
    pathParameter : Partial<TGetUserTaskTodoStateRequestPathParams>
}

export type TGetWorkspaceSessionHistoriesPayload = {
    query : Partial<TGetWorkspaceSessionHistoriesRequestQuery>
}