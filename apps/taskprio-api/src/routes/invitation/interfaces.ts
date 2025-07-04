import { Request } from "express"
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js"

export interface IGetInvitationInfoRequest extends Request {
    params : {
        token : string
    } 
}

export interface IInviteToWorkspaceRequest extends IAuthenticatedRequest {
    params : {
        workspace_id : string
    }
    body : {
        projects : string[]
        emails : string[]
    }
}

export interface IAcceptInvitationRequest extends IAuthenticatedRequest {
    params : {
        invitation : string
    }
}