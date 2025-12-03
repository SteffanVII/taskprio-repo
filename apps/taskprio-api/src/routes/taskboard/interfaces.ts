import { TCreateTaskboardRequestBody, TDeactivateTaskboardRequestBody, TDropTaskboardRequestQuery, TGetProjectInactiveTaskboardsRequestQuery, TGetProjectTaskboardListRequestQuery, TGetTaskboardTrashTasksRequestParams, TReactivateTaskboardRequestBody } from "@repo/taskprio-types";
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface IGetProjectTaskboardListRequest extends IAuthenticatedRequest {
    query : TGetProjectTaskboardListRequestQuery
}

export interface IGetTaskboardTrashTasksRequest extends IAuthenticatedRequest {
    query : TGetTaskboardTrashTasksRequestParams
}

export interface ICreateTaskboardRequest extends IAuthenticatedProjectMemberRequest {
    body : TCreateTaskboardRequestBody
}

export interface IDeactivateTaskboardRequest extends IAuthenticatedProjectMemberRequest {
    body : TDeactivateTaskboardRequestBody
}

export interface IReactivateTaskboardRequest extends IAuthenticatedProjectMemberRequest {
    body : TReactivateTaskboardRequestBody
}

export interface IDropTaskboardRequest extends IAuthenticatedProjectMemberRequest {
    query : TDropTaskboardRequestQuery
}

export interface IGetProjectInactiveTaskboardsRequest extends IAuthenticatedProjectMemberRequest {
    query : TGetProjectInactiveTaskboardsRequestQuery
}