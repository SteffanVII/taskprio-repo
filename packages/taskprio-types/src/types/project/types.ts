import { EProjectRole } from "../../utilities/enums"

export type TCreateProjectRequestBody = {
    project_name : string,
    workspace_id : string,
}

export type TGetUserWorkspaceProjectsParams = {
    workspace_id : string
}

// Project

export type TProject = {
    project_id : string,
    project_name : string,
    project_members : TProjectMember[]
}

export type TProjectMember = {
    user_id : string,
    project_id : string,
    project_role : EProjectRole,
    joined_at : string,
    invited_by : string
}