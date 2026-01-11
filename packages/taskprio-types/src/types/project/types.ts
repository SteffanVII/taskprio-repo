import { Selectable, Updateable } from "kysely"
import { ProjectProject, ProjectProjectMembers } from "../../db"
import { TUser } from "../user/types"
import { TTag } from "../tag/types"
import { EProjectRole } from "./enums"
import { TTaskboard } from "../taskboard/types"

export type TCreateProjectRequestBody = {
    project_name: string,
    project_abbreviation?: string,
    project_color?: string,
    workspace_id: string,
}

export type TGetUserWorkspaceProjectsParams = {
    workspace_id: string
}

export type TUpdateProjectCustomizationRequestParams = {
    project_id: string
}

export type TUpdateProjectCustomizationRequestBody = Pick<Updateable<ProjectProject>, "project_name" | "project_abbreviation" | "project_color">

export type TUpdateProjectCustomizationResponseData = TProjectPrimitive;

export type TGetProjectMembersRequestParams = {
    project_id: string
}

export type TGetProjectMembersResponseData = TProjectMember[]

export type TAddProjectMembersRequestParams = {
    project_id: string
}

export type TAddProjectMembersRequestBody = {
    members: {
        user_id: string,
        role: EProjectRole
    }[]
}

export type TAddProjectMembersResponseData = TProjectMember[]

export type TUpdateProjectMemberRoleRequestParams = {
    project_id: string,
    member_id: string
}

export type TUpdateProjectMemberRoleRequestBody = {
    role: EProjectRole
}

export type TDeactivateProjectMemberRequestBody = {
    project_id: string,
    member_id: string
}

export type TReactivateProjectMemberRequestBody = {
    project_id: string,
    member_id: string
}

export type TGetProjectMemberRequestParams = {
    project_id: string,
    member_id: string
}

export type TDeactivateProjectRequestBody = {
    workspace_id: string,
    project_id: string
}

export type TDropProjectRequestQueryParams = {
    workspace_id: string,
    project_id: string,
    project_name: string
}

export type TReactivateProjectRequestBody = {
    workspace_id: string,
    project_id: string
}

export type TGetDeactivatedProjectsRequestParams = {
    workspace_id: string
}

export type TGetDeactivatedprojectsResponseData = TProjectInactiveForTable[]

export type TGetProjectListWithUserAssignedTasksRequestPathParams = {
    workspace_id: string
}

export type TGetProjectListWithUserAssignedTasksResponseData = TProjectWithUserAssignedTasks[]

// Project

export type TProject = Selectable<ProjectProject> & {
    project_members: TProjectMember[]
    project_tags: TTag[]
}

export type TProjectPrimitive = Selectable<ProjectProject>

export type TProjectMember = Selectable<ProjectProjectMembers> & Pick<TUser, "firstname" | "lastname" | "email">

export type TProjectInactiveForTable = TProjectPrimitive & {
    taskboards: number,
    members: number
}

export type TProjectWithUserAssignedTasks = Pick<
    TProject,
    "project_id" |
    "created_by" |
    "workspace_id" |
    "project_name" |
    "project_abbreviation" |
    "project_color"
> & {
    taskboards: Pick<TTaskboard, "task_board_id" | "task_board_name">[]
}