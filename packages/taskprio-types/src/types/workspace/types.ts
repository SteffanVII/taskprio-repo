import { Selectable } from "kysely"
import { TpUserUserProfilePhoto, WorkspaceWorkspace, WorkspaceWorkspaceMembers } from "../../db"
import { TUser } from "../user/types"
import { EWorkspaceRole } from "./enums"

export type TCreateWorkspaceBody = {
    workspace_name : string
}

export type TUpdateWorkspaceMemberRoleParams = {
    workspace_id : string,
    member_id : string
}

export type TUpdateWorkspaceMemberRoleBody = {
    role : EWorkspaceRole
}

export type TGetWorkspaceMemberParams = {
    workspace_id : string,
    member_id : string
}

export type TDeactivateWorkspaceMemberRequestBody = {
    workspace_id : string,
    member_id : string
}

export type TReactivateWorkspaceMemberRequestBody = {
    workspace_id : string,
    member_id : string
}

// Workspace

export type TWorkspace = Selectable<WorkspaceWorkspace> & {
    workspace_members : TWorkspaceMember[]
}

export type TWorkspaceMember = Selectable<WorkspaceWorkspaceMembers> & Pick<TUser, "firstname" | "lastname" | "email"> & {
    profile_photo : Pick<Selectable<TpUserUserProfilePhoto>, "photo_file_name" | "image_type" | "last_modified"> | null
}