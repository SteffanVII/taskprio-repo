import { Selectable, Updateable } from "kysely"
import { ProjectProject, ProjectProjectMembers } from "../../db"
import { TUser } from "../user/types"
import { TTag } from "../tag/types"
import { EProjectRole } from "./enums"

export type TCreateProjectRequestBody = {
    project_name : string,
    workspace_id : string,
}

export type TGetUserWorkspaceProjectsParams = {
    workspace_id : string
}

export type TUpdateProjectCustomizationRequestParams = {
    project_id : string
}

export type TUpdateProjectCustomizationRequestBody = Pick<Updateable<ProjectProject>, "project_name" | "project_abbreviation" | "project_color">

export type TUpdateProjectCustomizationResponseData = TProjectPrimitive;

export type TGetProjectMembersRequestParams = {
    project_id : string
}

export type TGetProjectMembersResponseData = TProjectMember[]

export type TAddProjectMembersRequestParams = {
    project_id : string
}

export type TAddProjectMembersRequestBody = {
    members : {
        user_id : string,
        role : EProjectRole
    }[]
}

export type TAddProjectMembersResponseData = TProjectMember[]

export type TUpdateProjectMemberRoleRequestParams = {
    project_id : string,
    member_id : string
}

export type TUpdateProjectMemberRoleRequestBody = {
    role : EProjectRole
}

export type TGetProjectMemberRequestParams = {
    project_id : string,
    member_id : string
}

export type TDeactivateProjectRequestBody = {
    workspace_id : string,
    project_id : string
}

export type TDropProjectRequestQueryParams = {
    workspace_id : string,
    project_id : string,
    project_name : string
}

export type TReactivateProjectRequestBody = {
    workspace_id : string,
    project_id : string
}

export type TGetDeactivatedProjectsRequestParams = {
    workspace_id : string
}

export type TGetDeactivatedprojectsResponseData = TProjectInactiveForTable[]

// Project

export type TProject = Selectable<ProjectProject> & {
    project_members : TProjectMember[]
    project_tags : TTag[]
}

export type TProjectPrimitive = Selectable<ProjectProject>

export type TProjectMember = Selectable<ProjectProjectMembers> & Pick<TUser, "firstname" | "lastname" | "email">

export type TProjectInactiveForTable = TProjectPrimitive & {
    taskboards : number,
    members : number   
}