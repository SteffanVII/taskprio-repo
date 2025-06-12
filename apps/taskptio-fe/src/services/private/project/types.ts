import { EProjectRole } from "@/lib/enums"

export type TCreateProjectPayload = {
    body : TCreateProjectBody
}

export type TCreateProjectBody = {
    project_name : string,
    workspace_id : string
}

export type TCreateProjectResponse = TProject

// Project

export type TProject = {
    project_id : string,
    project_name : string,
    project_slug : string,
    workspace_id : string,
    workspace_slug : string,
    project_members : TProjectMember[]
}

export type TProjectMember = {
    user_id : string,
    email : string,
    firstname : string,
    lastname : string,
    project_role : EProjectRole,
    joined_at : string,
    is_active : boolean
}