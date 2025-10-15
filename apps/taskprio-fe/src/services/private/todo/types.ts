import { TAddTaskToTodoRequestBody, TAddTaskToTodoRequestPathParams, TFinishTaskTodoSessionRequestPathParams, TGetTaskAssignedToUserByWorkspaceRequestPathParams, TGetUserTaskTodoStateRequestPathParams, TRemoveTaskFromTodoRequestPathParams, TUpdateTaskTodoStateRequestBody, TUpdateTaskTodoStateRequestPathParams, TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types/src"

// Mutation

export type TMoveTaskToTodoPayload = {
    pathParameters : TAddTaskToTodoRequestPathParams,
    body : TAddTaskToTodoRequestBody,
    optimisticHelpers? : {
        task : TUserTaskTodoState | TUserAvailableTaskTodo
    }
}

export type TUpdateTaskTodoStatePayload = {
    pathParameters : TUpdateTaskTodoStateRequestPathParams,
    body : TUpdateTaskTodoStateRequestBody
}

export type TRemoveTaskFromTodoPayload = {
    pathParameters : TRemoveTaskFromTodoRequestPathParams
}

export type TFinishTaskTodoSessionPayload = {
    pathParameters : TFinishTaskTodoSessionRequestPathParams
}

// Query

export type TGetTasksAssignedToUserByWorkspacePayload = {
    pathParameter : Partial<TGetTaskAssignedToUserByWorkspaceRequestPathParams>
}

export type TGetUserTaskTodoStatePayload = {
    pathParameter : Partial<TGetUserTaskTodoStateRequestPathParams>
}