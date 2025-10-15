import { IAuthenticatedRequest, IAuthenticatedWorkspaceMemberRequest } from "../../middlewares/interfaces.js";
import { TCreateWorkspaceBody, TGetWorkspaceMemberParams, TUpdateWorkspaceMemberRoleBody, TUpdateWorkspaceMemberRoleParams } from "@repo/taskprio-types";

export interface IGetWorkspaceRequest extends IAuthenticatedRequest {
    params : {
        workspace_id : string,
    }
}
 
export interface ICreateWorkspaceRequest extends IAuthenticatedRequest {
    body : TCreateWorkspaceBody
}

export interface IUpdateWorkspaceMemberRoleRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TUpdateWorkspaceMemberRoleParams,
    body : TUpdateWorkspaceMemberRoleBody
}

export interface IGetWorkspaceMemberRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TGetWorkspaceMemberParams
}