import { EWorkspaceRole } from "@repo/taskprio-types";
import { Generated } from "kysely";


export interface IWorkspaceTable {

    workspace_id : Generated<string>,
    workspace_name : string

}

export interface IWorkspaceBase64Table extends IWorkspaceTable {}

export interface IWorkspaceRoleTable {
    id : Generated<number>,
    role_name : string
}

export  interface IWorkspaceMembersTable {
    workspace_id : string,
    user_id : string,
    workspace_role : EWorkspaceRole,
    joined_at : Generated<Date>,
    invited_by : string
}

export interface IWorkspaceMembersBase64Table extends IWorkspaceMembersTable {}