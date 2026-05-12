import { TGetWorkspaceMemberParams, TUpdateWorkspaceMemberRoleBody, TUpdateWorkspaceMemberRoleParams, TWorkspace } from "@repo/taskprio-types"

// Query

export type TGetUserWorkspacesResponse = TWorkspace[]

export type TGetUserWorkspaceResponse = TWorkspace

export type TGetWorkspaceMemberPayload = {
    params: Partial<TGetWorkspaceMemberParams>
}

// Mutation

export type TCreateWorkspacePayload = {
    body: TCreateWorkspaceBody
}

export type TCreateWorkspaceBody = {
    workspace_name: string,
}

export type TCreateWorkspaceResponse = TWorkspace

export type TInviteToWorkspacePayload = {
    workspace_id: string,
    body: {
        projects: string[],
        emails: string[]
    }
}

export type TUpdateWorkspaceMemberRolePayload = {
    params: TUpdateWorkspaceMemberRoleParams,
    body: TUpdateWorkspaceMemberRoleBody
}

// Workspace

// export type TWorkspace = {
//     workspace_id : string,
//     workspace_name : string,
//     workspace_slug : string,
//     workspace_members : TWorkspaceMember[]
// }

// export type TWorkspaceMember = {
//     user_id : string,
//     email : string,
//     firstname : string,
//     lastname : string,
//     workspace_role : EWorkspaceRole,
//     joined_at : string,
//     invited_by : string
// }