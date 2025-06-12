import { EWorkspaceRole } from "@/lib/enums"

// Query

export type TGetUserWorkspacesResponse = TWorkspace[]

export type TGetUserWorkspaceResponse = TWorkspace

// Mutation

export type TCreateWorkspacePayload = {
    body : TCreateWorkspaceBody
}

export type TCreateWorkspaceBody = {
    workspace_name : string,
}

export type TCreateWorkspaceResponse = TWorkspace

export type TInviteToWorkspacePayload = {
    workspace_id : string,
    body : {
        projects : string[],
        emails : string[]
    }
}

// Workspace

export type TWorkspace = {
    workspace_id : string,
    workspace_name : string,
    workspace_slug : string,
    workspace_members : TWorkspaceMember[]
}

export type TWorkspaceMember = {
    user_id : string,
    email : string,
    firstname : string,
    lastname : string,
    workspace_role : EWorkspaceRole,
    joined_at : string,
    invited_by : string
}