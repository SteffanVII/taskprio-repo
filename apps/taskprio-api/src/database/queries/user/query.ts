import { PoolClient } from "pg";
import { databaseFunctionWrapper, getPoolClient } from "../../postgresql.js";
import { TUser, TUserSecure } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { IUserBase64Table } from "../../kysely/schemas/user.js";

// export async function getUserByEmail( email : string, secure : true, poolClient? : PoolClient ) : Promise<TUserSecure | undefined>
// export async function getUserByEmail( email : string, secure : false, poolClient? : PoolClient ) : Promise<TUser | undefined>
// export async function getUserByEmail( email : string, secure? : true, poolClient? : PoolClient ) : Promise<TUserSecure | undefined>

type GetUserByEmailFunction = {
    (email: string, secure: true ): Promise<TUserSecure | undefined>;
    (email: string, secure: false ): Promise<TUser | undefined>;
    (email: string, secure?: true ): Promise<TUserSecure | undefined>;
}

export const getUserByEmail = (async (
    email : string,
    secure : boolean | undefined = true
) : Promise<TUser | TUserSecure | undefined> => {

    const query = taskprioKysely.selectFrom( "tp_user.user_base64" )
    .select([
        "user_id",
        "email",
        "firstname",
        "lastname",
        "created_at",
        "last_modified"
    ]).$if( !secure, (q) => q.select( [
        "password_hashed",
        "google_user_id"
    ] ) )
    .where( "email", "=", email )

    return await query.executeTakeFirst()

}) as GetUserByEmailFunction

// export const getUserByEmail = databaseFunctionWrapper(
//     async (
//         client,
//         email : string,
//         secure : boolean
//     ) : Promise<TUser | TUserSecure | undefined> => {

//         const query = taskprioKysely.selectFrom( "tp_user.user_base64" )

//         query.select([
//             "tp_user.user_base64.user_id",
//             "tp_user.user_base64.email",
//             "tp_user.user_base64.firstname",
//             "tp_user.user_base64.lastname",
//             "tp_user.user_base64.created_at",
//             "tp_user.user_base64.last_modified"
//         ])

//         query.$if( !secure, (q) => q.select( [
//             "tp_user.user_base64.password_hashed",
//             "tp_user.user_base64.google_user_id"
//         ] ) )

//         query.where( "email", "=", email )

//         return await query.executeTakeFirst() as TUser | TUserSecure | undefined

//         // const user = await client.query({
//         //     text : `--sql
//         //         SELECT ${
//         //             secure ?
//         //             `--sql
//         //                 user_id,
//         //                 email,
//         //                 firstname,
//         //                 lastname,
//         //                 created_at,
//         //                 last_modified
//         //             `
//         //             :
//         //             `--sql
//         //                 *
//         //             `
//         //         }
//         //         FROM tp_user."user_base64"
//         //         WHERE email = $1
//         //     `,
//         //     values : [ email ]
//         // })

//         // console.log("user", user.rows);

//         // return user.rows[0]

//     }
// ) as GetUserByEmailFunction

// export const getUserByGoogleUserId = databaseFunctionWrapper(
//     async (
//         client,
//         googleUserId : string,
//         secure : boolean | undefined = true
//     ) : Promise<TUser | TUserSecure | undefined> => {

//         const user = await client.query({
//             text : `--sql
//                 SELECT ${
//                     secure ?
//                     `--sql
//                         user_id,
//                         email,
//                         firstname,
//                         lastname,
//                         created_at,
//                         last_modified
//                     `
//                     :
//                     `--sql
//                         *
//                     `
//                 }
//                 FROM tp_user."user_base64"
//                 WHERE google_user_id = $1
//             `,
//             values : [ googleUserId ]
//         })
//         return user.rows[0]

//     }
// )

export const getUserByGoogleUserIdKysely = async (
    googleUserId : string,
    secure : boolean | undefined = true
) : Promise< TUser | TUserSecure | undefined >=> {

    const query = taskprioKysely.selectFrom( "tp_user.user_base64" )
    .select([
        "user_id",
        "email",
        "firstname",
        "lastname",
        "created_at",
        "last_modified"
    ]).$if( !secure, (q) => q.select( [
        "password_hashed",
        "google_user_id"
    ] ) )
    .where( 'google_user_id', '=', googleUserId )

    return await query.executeTakeFirst()

}