import { TAddProjectMembersRequestBody, TAddProjectMembersRequestParams, TCreateProjectRequestBody, TGetProjectMemberRequestParams, TGetProjectMembersRequestParams, TGetUserWorkspaceProjectsParams, TUpdateProjectCustomizationRequestBody, TUpdateProjectCustomizationRequestParams, TUpdateProjectMemberRoleRequestBody, TUpdateProjectMemberRoleRequestParams } from "@repo/taskprio-types";
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest } from "../../middlewares/interfaces.js";

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