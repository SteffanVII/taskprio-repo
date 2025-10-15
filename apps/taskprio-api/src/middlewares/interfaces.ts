import { Request } from "express";
import { TJWTPayload } from "./types.js";
import { EWorkspaceRole } from "@repo/taskprio-types";


export interface IAuthenticatedRequest extends Request {
    user : TJWTPayload
}

export interface IAuthenticatedProjectMemberRequest extends IAuthenticatedRequest {
    projectId : string
}

export interface IAuthenticatedWorkspaceMemberRequest extends IAuthenticatedRequest {
    workspaceId : string,
    workspaceRole : EWorkspaceRole
}