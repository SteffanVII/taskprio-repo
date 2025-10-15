import { DB, TUser } from "@repo/taskprio-types";
import { databaseFunctionWrapper, EDatabaseFunction, EDatabaseFunctionWrapperMode, getPoolClient } from "../../postgresql.js";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql, Transaction } from "kysely";

// export const createUser = databaseFunctionWrapper(
//     async (
//         client,
//         user : Omit<TUser, "user_id" | "created_at" | "last_modified">
//     ) : Promise<TUser> => {

//         const createdUser = await client.query({
//             text : `--sql
//                 INSERT INTO tp_user."user" (
//                     email,
//                     firstname,
//                     lastname,
//                     password_hashed,
//                     google_user_id
//                 )
//                 VALUES (
//                     $1,
//                     $2,
//                     $3,
//                     $4,
//                     $5
//                 )
//                 RETURNING 
//                     public.uuid_to_base64(user_id) as user_id,
//                     email,
//                     firstname,
//                     lastname,
//                     password_hashed,
//                     google_user_id,
//                     created_at,
//                     last_modified
//                 ;
//             `,
//             values :[
//                 user.email,
//                 user.firstname,
//                 user.lastname,
//                 user.password_hashed || null,
//                 user.google_user_id || null
//             ]
//         })

//         return createdUser.rows[0];

//     },
//     EDatabaseFunctionWrapperMode.TRANSACTION
// )

export const createUser = async (
    user : Omit<TUser, "user_id" | "created_at" | "last_modified">,
    trx? : Transaction<DB>
) : Promise<TUser> => {

    const queryBuilder = trx ? trx : taskprioKysely

    const createdUser = await queryBuilder
        .insertInto( "tp_user.user" )
        .values({
            email : user.email,
            firstname : user.firstname,
            lastname : user.lastname,
            password_hashed : user.password_hashed || null,
            google_user_id : user.google_user_id || null
        })
        .returning([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(user_id)`.as( "user_id" ),
            "email",
            "firstname",
            "lastname",
            "password_hashed",
            "google_user_id",
            "created_at",
            "last_modified"
        ])
        .executeTakeFirst()

    return createdUser;
}