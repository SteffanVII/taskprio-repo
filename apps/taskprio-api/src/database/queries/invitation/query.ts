import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";


const getInvitationByTokenWorkspaceIdRecipient = async (
    token : string,
    workspace_id : string,
    email : string,
    poolClient? : PoolClient
) => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        const invitation = await client.query({
            text : `--sql
                SELECT * FROM public."workspace_invitations"
                WHERE token_string = $1 AND workspace_id = $2 AND email = $3
            `,
            values : [
                token,
                workspace_id,
                email
            ]
        })

    } catch (error) {
        console.error(error)
        throw error
    } finally {
        release()
    }

}