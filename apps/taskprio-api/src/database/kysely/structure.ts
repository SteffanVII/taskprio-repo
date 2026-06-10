import { IUserBase64Table, IUserTable } from "./schemas/user.js";
import { IWorkspaceBase64Table, IWorkspaceMembersBase64Table, IWorkspaceMembersTable, IWorkspaceRoleTable, IWorkspaceTable } from "./schemas/workspace.js";

export interface ITaskprioDatabase {
    
    "tp_user.user" : IUserTable,
    "tp_user.user_base64" : IUserBase64Table,

    "workspace.workspace" : IWorkspaceTable,
    "workspace.workspace_base64" : IWorkspaceBase64Table,
    "workspace.workspace_role" : IWorkspaceRoleTable,
    "workspace.workspace_members" : IWorkspaceMembersTable,
    "workspace.workspace_members_base64" : IWorkspaceMembersBase64Table,

}