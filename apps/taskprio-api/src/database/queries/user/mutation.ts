import { TUser } from "@repo/taskprio-types";
import { getPoolClient } from "../../postgresql.js";


export const createUser = async (
    user : Omit<TUser, "user_id" | "created_at" | "last_modified">
) => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient()

    try {

        if ( internalClient ) await client.query("BEGIN")

        const createdUser = await client.query({
            text : `--sql
                INSERT INTO public."user" (
                    email,
                    firstname,
                    lastname,
                    password_hashed,
                    google_user_id
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                RETURNING *
            `,
            values :[
                user.email,
                user.firstname,
                user.lastname,
                user.password_hashed || null,
                user.google_user_id || null
            ]
        })

        if ( internalClient ) await client.query("COMMIT")

        return createdUser.rows[0];

    } catch (error) {
        console.error(error);
        if ( internalClient ) await client.query("ROLLBACK")
        throw error;
    } finally {
        release();
    }
}