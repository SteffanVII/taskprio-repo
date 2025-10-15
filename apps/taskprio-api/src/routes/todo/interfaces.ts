import { TAddTaskToTodoRequestBody, TAddTaskToTodoRequestPathParams, TFinishTaskTodoSessionRequestPathParams, TGetTaskAssignedToUserByWorkspaceRequestPathParams, TGetUserTaskTodoStateRequestPathParams, TRemoveTaskFromTodoRequestPathParams, TUpdateTaskTodoStateRequestBody, TUpdateTaskTodoStateRequestPathParams } from "@repo/taskprio-types";
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

// Query
export interface IGetAvailableTasksRequest extends IAuthenticatedRequest {
    params : TGetTaskAssignedToUserByWorkspaceRequestPathParams
}

export interface IGetUserTaskTodoStateRequest extends IAuthenticatedRequest {
    params : TGetUserTaskTodoStateRequestPathParams
}