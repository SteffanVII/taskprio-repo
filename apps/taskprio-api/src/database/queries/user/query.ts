import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TUser } from "../../../routes/user/types.js";


export const getUserByEmail = async ( email : string, poolClient? : PoolClient ) : Promise<TUser | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const user = await client.query({
            text : `--sql
                SELECT * FROM public."user" WHERE email = $1
            `,
            values : [ email ]
        })
        return user.rows[0]
    } catch (error) {
        console.error(error)
        throw error
    } finally {
        release()
    }

}

export const getUserByGoogleUserId = async ( google_user_id : string, poolClient? : PoolClient ) : Promise<TUser | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const user = await client.query({
            text : `--sql
                SELECT * FROM public."user" WHERE google_user_id = $1
            `,
            values : [ google_user_id ]
        })
        return user.rows[0]
    } catch (error) {
        console.error(error)
        throw error
    } finally {
        release()
    }

}
