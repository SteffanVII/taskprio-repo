import { TCreateProjectRequestBody, TGetUserWorkspaceProjectsParams } from "@repo/taskprio-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface ICreateProjectRequest extends IAuthenticatedRequest {
    body : TCreateProjectRequestBody
}

export interface IGetUserWorkspaceProjectsRequest extends IAuthenticatedRequest {
    params : TGetUserWorkspaceProjectsParams
}