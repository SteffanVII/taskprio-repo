import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { TCreateWorkspaceBody } from "./types.js";

export interface IGetWorkspaceRequest extends IAuthenticatedRequest {
    params : {
        workspace_id : string,
    }
}
 
export interface ICreateWorkspaceRequest extends IAuthenticatedRequest {
    body : TCreateWorkspaceBody
}