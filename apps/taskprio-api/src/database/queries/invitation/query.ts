import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TWorkspaceInvitation } from "@repo/taskprio-types";


export const getInvitationByToken_WorkspaceId_Recipient = async (
    token : string,
    workspace_id : string,
    email : string,
    poolClient? : PoolClient
) : Promise<TWorkspaceInvitation | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        const invitation = await client.query({
            text : `--sql
                SELECT * FROM invitation."workspace_invitation"
                WHERE token_string = $1 AND workspace_id = $2 AND email = $3
            `,
            values : [
                token,
                workspace_id,
                email
            ]
        })

        return invitation.rows[0]

    } catch (error) {
        console.error(error)
        throw error
    } finally {
        release()
    }

}