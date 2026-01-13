import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { DB, EWorkspaceRole, TCreateWorkspaceBody, TWorkspace, TWorkspaceMember } from "@repo/taskprio-types";
import { getUserWorkspace } from "./query.js";
import { jsonBuildObject } from "kysely/helpers/postgres";

export const createWorkspace = async (
    body : TCreateWorkspaceBody,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspace> => {

    let workspace : TWorkspace;

    const query = async ( finalTrx : Transaction<DB> ) => {

        const createdWorkspace = await finalTrx
            .insertInto( "workspace.workspace" )
            .values({
                workspace_name : body.workspace_name
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        await finalTrx.insertInto( "workspace.workspace_members" )
            .values({
                workspace_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdWorkspace.workspace_id})`,
                user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                workspace_role : EWorkspaceRole.OWNER,
                invited_by : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
            })
            .executeTakeFirstOrThrow();

        const returnValue = await getUserWorkspace( createdWorkspace.workspace_id, userId, finalTrx )

        return returnValue;
    }

    if ( trx ) {
        workspace = await query( trx )
    } else {
        workspace = await taskprioKysely.transaction().execute( async trx1 => {
            return await query( trx1 )
        } )
    }

    return workspace

}

// export const createWorkspace = databaseFunctionWrapper(
//     async (
//         client,
//         body : TCreateWorkspaceBody,
//         userId : string
//     ) : Promise<TWorkspace | undefined> => {

//         const createdWorkspace = await client.query({
//             text : `--sql
//                 INSERT INTO workspace."workspace" (
//                     workspace_name
//                 )
//                 VALUES ( $1 )
//                 RETURNING * ;
//             `,
//             values : [ body.workspace_name ]
//         })

//         await client.query({
//             text : `--sql
//                 INSERT INTO workspace."workspace_members" (
//                     workspace_id,
//                     user_id,
//                     workspace_role,
//                     invited_by
//                 )
//                 VALUES (
//                     $1,
//                     public.detect_and_convert_to_uuid($2),
//                     $3,
//                     public.detect_and_convert_to_uuid($4)
//                 )
//             `,
//             values : [ createdWorkspace.rows[0].workspace_id, userId, EWorkspaceRole.OWNER + 1, userId ]
//         })

//         const workspace = await getUserWorkspace( createdWorkspace.rows[0].workspace_id, userId )

//         return workspace

//     },
//     EDatabaseFunctionWrapperMode.TRANSACTION
// )

/**
 * Add a member to a workspace
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user to add
 * @param email - The email of the user to add
 * @param workspaceRole - The role of the user to add
 * @param invitedBy - The ID of the user who invited the user
 * @returns The workspace member
 */
export const addWorkspaceMember = async (
    workspaceId : string,
    userId : string,
    workspaceRole : EWorkspaceRole,
    invitedBy : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {

    const query = async ( trx : Transaction<DB> ) => {
        await trx.insertInto( "workspace.workspace_members" )
            .values({
                workspace_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`,
                user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                workspace_role : workspaceRole,
                invited_by : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
            })
            .executeTakeFirstOrThrow()

        return await trx.selectFrom( "workspace.workspace_members" )
            .leftJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
            .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
            .select( eb => [
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
                "workspace.workspace_members.workspace_role",
                "workspace.workspace_members.is_active",
                "workspace.workspace_members.joined_at",
                "tp_user.user.email",
                "tp_user.user.firstname",
                "tp_user.user.lastname",
                eb.case()
                    .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                    .then( jsonBuildObject({
                        photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                        image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                        last_modified : eb.ref( "tp_user.user_profile_photo.last_modified" )
                    }) )
                    .else( sql<null>`null` )
                    .end()
                    .as( "profile_photo" )
            ])
            .where( "workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx1 => {
            return await query( trx1 )
        } )
    }


}

// export const addWorkspaceMember = databaseFunctionWrapper(
//     async (
//         client,
//         workspaceId : string,
//         userId : string,
//         email : string,
//         workspaceRole : EWorkspaceRole,
//         invitedBy : string
//     ) : Promise<TWorkspaceMember | undefined> => {

//         await client.query({
//             text : `--sql
//                 INSERT INTO workspace."workspace_members" (
//                     workspace_id,
//                     user_id,
//                     workspace_role,
//                     invited_by
//                 ) VALUES (
//                     public.detect_and_convert_to_uuid($1),
//                     public.detect_and_convert_to_uuid($2),
//                     $3,
//                     public.detect_and_convert_to_uuid($4)
//                 )
//             `,
//             values : [
//                 workspaceId,
//                 userId,
//                 workspaceRole,
//                 invitedBy
//             ]
//         })

//         await client.query({
//             text : `--sql
//                 UPDATE invitation."workspace_invitation" 
//                 SET accepted = TRUE 
//                 WHERE workspace_id = public.detect_and_convert_to_uuid($1) 
//                 AND email = $2
//             `,
//             values : [
//                 workspaceId,
//                 email
//             ]
//         })

//         const workspaceMember = await getWorkspaceMember( workspaceId, userId, client )

//         return workspaceMember

//     },
//     EDatabaseFunctionWrapperMode.TRANSACTION
// )

export const updateWorkspaceMemberRole = async (
    workspaceId : string,
    memberId : string,
    role : EWorkspaceRole,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {
        await trx.updateTable( "workspace.workspace_members" )
            .set({
                workspace_role : role
            })
            .where( "workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${memberId})` )
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const deactivateWorkspaceMember = async (
    userId : string,
    workspaceId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        await trx.updateTable( "workspace.workspace_members" )
            .set({
                is_active : false
            })
            .where( "workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .executeTakeFirstOrThrow()

        const foundActiveTimer = await trx.selectFrom( "taskboard.task_todo_timer" )
            .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "taskboard.task_todo_timer.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "taskboard.task_todo_timer.stop", "is", null )
            .executeTakeFirst()

        if ( foundActiveTimer ) {
            await trx.updateTable( "taskboard.task_todo_timer" )
                .set({
                    stop : sql.raw("CURRENT_TIMESTAMP"),
                    last_seen : sql.raw("CURRENT_TIMESTAMP")
                })
                .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .where( "taskboard.task_todo_timer.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
                .where( "taskboard.task_todo_timer.stop", "is", null )
                .executeTakeFirstOrThrow()
        }

    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const reactivateWorkspaceMember = async (
    userId : string,
    workspaceId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {
        await trx.updateTable( "workspace.workspace_members" )
            .set({
                is_active : true
            })
            .where( "workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}