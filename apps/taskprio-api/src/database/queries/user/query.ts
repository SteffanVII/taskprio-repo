import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TUser, TUserSecure } from "@repo/taskprio-types";

export async function getUserByEmail( email : string, secure : true, poolClient? : PoolClient ) : Promise<TUserSecure | undefined>
export async function getUserByEmail( email : string, secure : false, poolClient? : PoolClient ) : Promise<TUser | undefined>
export async function getUserByEmail( email : string, secure? : true, poolClient? : PoolClient ) : Promise<TUserSecure | undefined>

export async function getUserByEmail(
    email : string,
    secure : boolean | undefined = true,
    poolClient? : PoolClient
) : Promise<TUser | TUserSecure | undefined> {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const user = await client.query({
            text : `--sql
                SELECT ${
                    secure ?
                    "user_id, email, firstname, lastname, created_at, last_modified"
                    :
                    "*"
                }
                FROM tp_user."user"
                WHERE email = $1
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

export const getUserByGoogleUserId = async (
    google_user_id : string,
    secure : boolean | undefined = true,
    poolClient? : PoolClient
) : Promise<TUser | TUserSecure | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const user = await client.query({
            text : `--sql
                SELECT ${
                    secure ?
                    "user_id, email, firstname, lastname, created_at, last_modified"
                    :
                    "*"
                }
                FROM tp_user."user"
                WHERE google_user_id = $1
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
