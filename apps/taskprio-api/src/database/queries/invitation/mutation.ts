import { PoolClient } from "pg"
import { getPoolClient } from "../../postgresql.js"

/**
 * Updates the invitation to accepted.
 * REMINDER : This does not add the user to the workspace
 * @param token - The token of the invitation
 * @param workspaceId - The id of the workspace
 * @param email - The email of the recipient
 */
export const acceptInvitation = async (
    token : string,
    workspaceId : string,
    email : string,
    poolClient? : PoolClient
) => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)
    
    try {

        if ( internalClient ) client.query("BEGIN")

        await client.query({
            text : `--sql
                UPDATE invitation."workspace_invitation"
                SET accepted = TRUE
                WHERE token_string = $1
                AND workspace_id = $2
                AND email = $3
            `,
            values : [
                token,
                workspaceId,
                email
            ]
        })

        if ( internalClient ) client.query("COMMIT")

    } catch (error) {
        console.log(error)
        if ( internalClient ) client.query("ROLLBACK")
    } finally {
        release()
    }

}