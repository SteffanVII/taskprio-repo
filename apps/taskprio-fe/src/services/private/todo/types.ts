import { TAddTaskToTodoRequestBody, TAddTaskToTodoRequestPathParams, TFinishTaskTodoSessionRequestPathParams, TGetAvailableTasksByWorkspaceRequestPathParams, TGetUserTaskTodoStateRequestPathParams, TRemoveTaskFromTodoRequestPathParams, TStartOrStopTaskTodoTimerRequestPathParams, TUpdateTaskTodoStateRequestBody, TUpdateTaskTodoStateRequestPathParams, TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types/src"

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

// Query

export type TGetTasksAssignedToUserByWorkspacePayload = {
    pathParameter : Partial<TGetAvailableTasksByWorkspaceRequestPathParams>
}

export type TGetUserTaskTodoStatePayload = {
    pathParameter : Partial<TGetUserTaskTodoStateRequestPathParams>
}