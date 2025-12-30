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
        .leftJoin("workspace.workspace", "invitation.workspace_invitation.workspace_id", "workspace.workspace.workspace_id")
        .leftJoin("tp_user.user", "invitation.workspace_invitation.sender_id", "tp_user.user.user_id")
        .select([
            "token_string",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(sender_id)`.as("sender_id"),
            "email",
            "accepted",
            "created_at",
            "workspace.workspace.workspace_name",
            "tp_user.user.email as sender_email",
            "tp_user.user.firstname as sender_firstname",
            "tp_user.user.lastname as sender_lastname"
        ])
        .where("token_string", "=", token)
        .where("workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
        .where("email", "=", email)

    return await query.executeTakeFirst()

}