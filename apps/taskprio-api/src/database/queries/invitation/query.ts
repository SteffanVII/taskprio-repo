import { sql } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { TWorkspaceInvitationExtended } from "@repo/taskprio-types";

export const getInvitation = async (
    token: string,
    workspaceId: string,
    email: string
): Promise<TWorkspaceInvitationExtended | undefined> => {

    const query = taskprioKysely.selectFrom("invitation.workspace_invitation")
        .leftJoin("workspace.workspace", "workspace.workspace.workspace_id", "invitation.workspace_invitation.workspace_id")
        .leftJoin("tp_user.user", "tp_user.user.user_id", "invitation.workspace_invitation.sender_id")
        .select([
            "invitation.workspace_invitation.token_string",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(invitation.workspace_invitation.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(invitation.workspace_invitation.sender_id)`.as("sender_id"),
            "invitation.workspace_invitation.email",
            "invitation.workspace_invitation.accepted",
            "invitation.workspace_invitation.created_at",
            "workspace.workspace.workspace_name",
            "tp_user.user.email as sender_email",
            "tp_user.user.firstname as sender_firstname",
            "tp_user.user.lastname as sender_lastname"
        ])
        .where("invitation.workspace_invitation.token_string", "=", token)
        .where("invitation.workspace_invitation.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
        .where("invitation.workspace_invitation.email", "=", email)

    return await query.executeTakeFirst()

}