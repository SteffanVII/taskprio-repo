import { sql } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { TWorkspaceInvitation } from "@repo/taskprio-types";

export const getInvitation = async (
    token : string,
    workspaceId : string,
    email : string
) : Promise<TWorkspaceInvitation | undefined> => {

    const query = taskprioKysely.selectFrom( "invitation.workspace_invitation" )
        .select([
            "token_string",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(sender_id)`.as( "sender_id" ),
            "email",
            "accepted",
            "created_at"
        ])
        .where( "token_string", "=", token )
        .where( "workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .where( "email", "=", email )

    return await query.executeTakeFirst()

}