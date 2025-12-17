import { TAddTaskToTodoRequestBody, TAddTaskToTodoRequestPathParams, TCompleteTaskTodoRequestPathParams, TFinishTaskTodoSessionRequestPathParams, TGetAvailableTasksByProjectRequestPathParams, TGetAvailableTasksByProjectRequestQuery, TGetAvailableTasksByWorkspaceRequestPathParams, TGetUserTaskTodoStateRequestPathParams, TRemoveTaskFromTodoRequestPathParams, TStartOrStopTaskTodoTimerRequestPathParams, TUpdateTaskTodoStateRequestBody, TUpdateTaskTodoStateRequestPathParams } from "@repo/taskprio-types";
import { IAuthenticatedRequest, IAuthenticatedWorkspaceMemberRequest } from "../../middlewares/interfaces.js";

// Mutation
export interface IAddTaskToTodoRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TAddTaskToTodoRequestPathParams,
    body : TAddTaskToTodoRequestBody
}

export interface IUpdateTaskTodoStateRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TUpdateTaskTodoStateRequestPathParams,
    body : TUpdateTaskTodoStateRequestBody
}

export interface IRemoveTaskFromTodoRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TRemoveTaskFromTodoRequestPathParams
}

export interface IFinishTaskTodoSessionRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TFinishTaskTodoSessionRequestPathParams
}

export interface IStartOrStopTaskTodoTimerRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TStartOrStopTaskTodoTimerRequestPathParams
}

export interface ICompleteTaskTodoRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TCompleteTaskTodoRequestPathParams 
}

// Query
export interface IGetAvailableTasksByWorkspaceRequest extends IAuthenticatedRequest {
    params : TGetAvailableTasksByWorkspaceRequestPathParams
}

export interface IGetUserTaskTodoStateRequest extends IAuthenticatedRequest {
    params : TGetUserTaskTodoStateRequestPathParams
}

export interface IGetAvailableTasksByProjectRequest extends IAuthenticatedRequest {
    params : TGetAvailableTasksByProjectRequestPathParams,
    query : TGetAvailableTasksByProjectRequestQuery
}