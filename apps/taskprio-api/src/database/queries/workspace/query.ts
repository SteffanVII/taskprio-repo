import { PoolClient } from "pg";
import { databaseFunctionWrapper, EDatabaseFunction, getPoolClient } from "../../postgresql.js";
import { DB, TWorkspace, TWorkspaceMember } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { TransactionBuilder } from "kysely";
import { Kysely } from "kysely";
import { Transaction } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom, jsonBuildObject, jsonObjectFrom } from "kysely/helpers/postgres";

/**
 * Get the workspace of a user
 * @param workspaceId - The base64 encoded ID of the workspace
 * @param userId - The ID of the user
 * @returns The workspace
 */
export const getUserWorkspace = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspace | undefined> => {

    console.log( workspaceId, userId );

    let workspace : TWorkspace | undefined;

    const query = async ( trx : Transaction<DB> ) : Promise<TWorkspace | undefined> => {

        const q = trx
            .selectFrom( "workspace.workspace" )
            .innerJoin( "workspace.workspace_members", "workspace.workspace.workspace_id", "workspace.workspace_members.workspace_id" )
            .select( eb => [
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace.workspace_id)`.as( "workspace_id" ),
                "workspace.workspace.workspace_name",
                jsonArrayFrom(
                    eb.selectFrom( "workspace.workspace_members" )
                        .leftJoin( "tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id" )
                        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
                        .select( eb => [
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
                            "tp_user.user.email",
                            "tp_user.user.firstname",
                            "tp_user.user.lastname",
                            "workspace.workspace_members.workspace_role",
                            sql<Date>`workspace.workspace_members.joined_at::timestamp`.as( "joined_at" ),
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
                            eb.case()
                                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                                .then( jsonBuildObject({
                                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                                }) )
                                .else( sql<null>`null` )
                                .end()
                                .as( "profile_photo" )
                        ])
                        .where( "workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
                        .where( "tp_user.user.user_id", "is not", null )
                ).as( "workspace_members" )
            ] )
            .where( "workspace.workspace.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .groupBy( [ "workspace.workspace.workspace_id", "workspace.workspace.workspace_name" ] )

        return await q.executeTakeFirst();
            
    }

    if ( trx ) {
        workspace = await query( trx );
    } else {
        workspace = await taskprioKysely.transaction().execute( async trx1 => {
            return await query( trx1 );
        } )
    }

    return workspace;

}
// export const getUserWorkspace = databaseFunctionWrapper(
//     async (
//         client,
//         workspaceId : string,
//         userId : string
//     ) : Promise<TWorkspace | undefined> => {

//         const workspace = await client.query({
//             text : `--sql
//                 SELECT
//                     public.uuid_to_base64(w.workspace_id) as workspace_id,
//                     w.workspace_name,
//                     json_agg(
//                         json_build_object(
//                             'user_id', public.uuid_to_base64(all_members_wm.user_id),
//                             'email', all_members_u.email,
//                             'firstname', all_members_u.firstname,
//                             'lastname', all_members_u.lastname,
//                             'workspace_role', all_members_wm.workspace_role,
//                             'joined_at', all_members_wm.joined_at,
//                             'invited_by', public.uuid_to_base64(all_members_wm.invited_by)
//                         )
//                     ) as workspace_members
//                 FROM
//                     workspace."workspace" w
//                 JOIN
//                     workspace."workspace_members" querying_user_wm ON w.workspace_id = querying_user_wm.workspace_id
//                 JOIN
//                     workspace."workspace_members" all_members_wm ON w.workspace_id = all_members_wm.workspace_id
//                 JOIN
//                     tp_user."user" all_members_u ON all_members_wm.user_id = all_members_u.user_id
//                 WHERE
//                     w.workspace_id = public.detect_and_convert_to_uuid($1)
//                     AND querying_user_wm.user_id = public.detect_and_convert_to_uuid($2)
//                 GROUP BY
//                     w.workspace_id, w.workspace_name;
//             `,
//             values : [ workspaceId, userId ]
//         })
//         return workspace.rows[0]

//     }
// )

/**
 * Get the workspaces of a user
 * @param userId - The ID of the user
 * @returns The workspaces
 */
export const getUserWorkspaces = async (
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspace[]> => {

    const queryBuilder = trx ? trx.selectFrom( "workspace.workspace" ) : taskprioKysely.selectFrom( "workspace.workspace" );

    const workspaces = await queryBuilder
        .leftJoin( "workspace.workspace_members", "workspace.workspace.workspace_id", "workspace.workspace_members.workspace_id" )
        .leftJoin( "tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "tp_user.user.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace.workspace_id)`.as( "workspace_id" ),
            "workspace.workspace.workspace_name",
            eb.fn.coalesce(
                eb.fn.jsonAgg(
                    jsonBuildObject({
                        user_id : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`,
                        email : eb.ref(`tp_user.user.email`),
                        firstname : eb.ref(`tp_user.user.firstname`),
                        lastname : eb.ref(`tp_user.user.lastname`),
                        workspace_role : eb.ref(`workspace.workspace_members.workspace_role`),
                        workspace_id : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`,
                        invited_by : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`,
                        joined_at : eb.ref(`workspace.workspace_members.joined_at`),
                        profile_photo : eb.case()
                            .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                            .then( jsonBuildObject({
                                photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                                image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                            }) )
                            .else( sql<null>`null` )
                            .end()
                    })
                )
            ).as( "workspace_members" )
        ] )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .groupBy( [ "workspace.workspace.workspace_id", "workspace.workspace.workspace_name" ] )
        .execute();
    
    return workspaces;

}
// export const getUserWorkspaces = databaseFunctionWrapper(
//     async (
//         client,
//         userId : string
//     ) : Promise<TWorkspace[]> => {

//         const workspaces = await client.query({
//             text : `--sql
//                 SELECT
//                     public.uuid_to_base64(w.workspace_id) as workspace_id,
//                     w.workspace_name,
//                     json_agg(
//                         json_build_object(
//                             'user_id', public.uuid_to_base64(all_members_wm.user_id),
//                             'email', all_members_u.email,
//                             'firstname', all_members_u.firstname,
//                             'lastname', all_members_u.lastname,
//                             'workspace_role', all_members_wm.workspace_role,
//                             'joined_at', all_members_wm.joined_at,
//                             'invited_by', public.uuid_to_base64(all_members_wm.invited_by)
//                         )
//                     ) as workspace_members
//                 FROM
//                     workspace."workspace" w
//                 JOIN
//                     workspace."workspace_members" querying_user_wm ON w.workspace_id = querying_user_wm.workspace_id
//                 JOIN
//                     workspace."workspace_members" all_members_wm ON w.workspace_id = all_members_wm.workspace_id
//                 JOIN
//                     tp_user."user" all_members_u ON all_memberS_wm.user_id = all_members_u.user_id
//                 WHERE
//                     querying_user_wm.user_id = public.detect_and_convert_to_uuid($1)
//                 GROUP BY
//                     w.workspace_id, w.workspace_name;
//             `,
//             values : [ userId ]
//         })

//         return workspaces.rows;

//     }
// )

/**
 * Get the workspace member of a workspace
 * @param workspaceId - The base64 encoded ID of the workspace
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMember = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "workspace.workspace_members" ) : taskprioKysely.selectFrom( "workspace.workspace_members" );

    const workspaceMember = await queryBuilder
        .leftJoin( "tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            eb.case()
                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                .then( jsonBuildObject({
                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                }) )
                .else( sql<null>`null` )
                .end()
                .as( "profile_photo" )
        ])
        .where( "workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${workspaceId})` )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .executeTakeFirst();
    
    return workspaceMember;


}

/**
 * Get the workspace member of a project
 * @param projectId - The base64 encoded ID of the project
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByProjectId = async (
    projectId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "project.workspace_projects" ) : taskprioKysely.selectFrom( "project.workspace_projects" );

    const workspaceMember = await queryBuilder
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.workspace_projects.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            eb.case()
                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                .then( jsonBuildObject({
                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                }) )
                .else( sql<null>`null` )
                .end()
                .as( "profile_photo" )
        ])
        .where( "project.workspace_projects.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${projectId})` )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a taskboard
 * @param taskboardId - The base64 encoded ID of the taskboard
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskboardId = async (
    taskboardId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_board" ) : taskprioKysely.selectFrom( "taskboard.task_board" );

    const workspaceMember = await queryBuilder
        .innerJoin( "project.workspace_projects", "project.workspace_projects.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.workspace_projects.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            eb.case()
                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                .then( jsonBuildObject({
                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                }) )
                .else( sql<null>`null` )
                .end()
                .as( "profile_photo" )
        ])
        .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskboardId})` )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a task section
 * @param taskSectionId - The base64 encoded ID of the task section
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskSectionId = async (
    taskSectionId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {
    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" );
    
    const workspaceMember = await queryBuilder
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.workspace_projects", "project.workspace_projects.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.workspace_projects.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            eb.case()
                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                .then( jsonBuildObject({
                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                }) )
                .else( sql<null>`null` )
                .end()
                .as( "profile_photo" )
        ])
        .where( "taskboard.task_section.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskSectionId})` )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a task
 * @param taskId - The base64 encoded ID of the task
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskId = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TWorkspaceMember | undefined> => {
    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" );
    
    const workspaceMember = await queryBuilder
        .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.workspace_projects", "project.workspace_projects.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.workspace_projects.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .leftJoin( "tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as( "user_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as( "invited_by" ),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            eb.case()
                .when( "tp_user.user_profile_photo.photo_file_name", "is not", null )
                .then( jsonBuildObject({
                    photo_file_name : eb.ref( "tp_user.user_profile_photo.photo_file_name" ),
                    image_type : eb.ref( "tp_user.user_profile_photo.image_type" ),
                }) )
                .else( sql<null>`null` )
                .end()
                .as( "profile_photo" )
        ])
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskId})` )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})` )
        .executeTakeFirst()

    return workspaceMember;
}

/**
 * @description Get the workspace id from a project id
 * @param project_id - The project id
 * @returns The workspace id
 */
export const getWorkspaceIdFromProjectId = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<string | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "project.workspace_projects" ) : taskprioKysely.selectFrom( "project.workspace_projects" );

    const workspaceId = await queryBuilder
        .select( sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as( "workspace_id") )
        .where( "project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${projectId})` )
        .executeTakeFirst()

    return workspaceId?.workspace_id;

}

export const getWorkspaceIdFromTaskId = async (
    taskId : string,
    trx? : Transaction<DB>
) : Promise<string | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" );

    return (await queryBuilder
        .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.workspace_projects", "project.workspace_projects.project_id", "taskboard.task_board.project_id" )
        .select( sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.workspace_projects.workspace_id)`.as( "workspace_id" ) )
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .executeTakeFirst()).workspace_id;

}