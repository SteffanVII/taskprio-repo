import { TAddProjectMembersRequestBody, TAddProjectMembersRequestParams, TCreateProjectRequestBody, TDropProjectRequestQueryParams, TGetDeactivatedProjectsRequestParams, TGetProjectMemberRequestParams, TGetProjectMembersRequestParams, TGetUserWorkspaceProjectsParams, TReactivateProjectRequestBody, TUpdateProjectCustomizationRequestBody, TUpdateProjectCustomizationRequestParams, TUpdateProjectMemberRoleRequestBody, TUpdateProjectMemberRoleRequestParams } from "@repo/taskprio-types";
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest, IAuthenticatedWorkspaceMemberRequest } from "../../middlewares/interfaces.js";
import { TDeactivateProjectRequestBody } from "@repo/taskprio-types";

export interface ICreateProjectRequest extends IAuthenticatedRequest {
    body : TCreateProjectRequestBody
}

export interface IGetUserWorkspaceProjectsRequest extends IAuthenticatedRequest {
    params : TGetUserWorkspaceProjectsParams
}

export interface IUpdateProjectCustomizationRequest extends IAuthenticatedRequest {
    params : TUpdateProjectCustomizationRequestParams,
    body : TUpdateProjectCustomizationRequestBody
}

export interface IGetProjectMembersRequest extends IAuthenticatedProjectMemberRequest {
    params : TGetProjectMembersRequestParams   
}

export interface IAddProjectMembersRequest extends IAuthenticatedProjectMemberRequest {
    params : TAddProjectMembersRequestParams,
    body : TAddProjectMembersRequestBody
}

export interface IUpdateProjectMemberRoleRequest extends IAuthenticatedProjectMemberRequest {
    params : TUpdateProjectMemberRoleRequestParams,
    body : TUpdateProjectMemberRoleRequestBody
}

export interface IGetProjectMemberRequest extends IAuthenticatedProjectMemberRequest {
    params : TGetProjectMemberRequestParams
}

export interface IDeactivateProjectRequest extends IAuthenticatedWorkspaceMemberRequest {
    body : TDeactivateProjectRequestBody
}

export interface IDropProjectRequest extends IAuthenticatedWorkspaceMemberRequest {
    query : TDropProjectRequestQueryParams
}

export interface IReactivateProjectRequest extends IAuthenticatedWorkspaceMemberRequest {
    body : TReactivateProjectRequestBody
}

export interface IGetDeactivatedProjectsRequest extends IAuthenticatedWorkspaceMemberRequest {
    params : TGetDeactivatedProjectsRequestParams
}