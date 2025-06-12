import { IAuthenticatedRequest } from "../../middlewares/interfaces.js"

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