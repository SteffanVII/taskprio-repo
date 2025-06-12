import { TCreateProjectRequestBody, TGetUserWorkspaceProjectsParams } from "./types.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface ICreateProjectRequest extends IAuthenticatedRequest {
    body : TCreateProjectRequestBody
}

export interface IGetUserWorkspaceProjectsRequest extends IAuthenticatedRequest {
    params : TGetUserWorkspaceProjectsParams
}