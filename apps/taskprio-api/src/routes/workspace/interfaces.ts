import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { TCreateWorkspaceBody } from "@repo/taskprio-types";

export interface IGetWorkspaceRequest extends IAuthenticatedRequest {
    params : {
        workspace_id : string,
    }
}
 
export interface ICreateWorkspaceRequest extends IAuthenticatedRequest {
    body : TCreateWorkspaceBody
}