import { databaseFunctionWrapper, EDatabaseFunction, EDatabaseFunctionWrapperMode, getPoolClient } from "../../postgresql.js";
import { getProject, getProjectMember, getProjectMembersByTheirUserId } from "./query.js";
import { createTaskboard } from "../taskboard/mutation.js";
import { DB, EProjectRole, TCreateProjectRequestBody, TProject, TProjectMember, TProjectPrimitive, TUpdateProjectCustomizationRequestBody } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql } from "kysely";
import { Transaction } from "kysely";
import { getProjectNameAbbreviation } from "../../../utilities/projectAbbreviation.js";

export const createProject = async (
    body : TCreateProjectRequestBody,
    userId : string
) : Promise<TProject | undefined> => {

    const projectNameAbbreviation = getProjectNameAbbreviation( body.project_name )

    return await taskprioKysely.transaction().execute( async trx => {

        const createdProject = await trx.insertInto( "project.project" )
            .values({
                project_name : body.project_name
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        await trx.insertInto( "project.workspace_projects" )
            .values({
                workspace_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${body.workspace_id})`,
                project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
                user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        await trx.insertInto( "project.project_members" )
            .values({
                user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
                project_role : EProjectRole.OWNER,
                invited_by : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        await trx.insertInto( "taskboard.task_board" )
            .values({
                project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
                task_board_name : body.project_name + " Board"
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        return await getProject( createdProject.project_id, trx )

    } )

}

export const addProjectMember = async (
    projectId : string,
    userId : string,
    invitedBy : string,
    projectRole : EProjectRole,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = trx ? trx.insertInto( "project.project_members" ) : taskprioKysely.insertInto( "project.project_members" )

    await query
        .values({
            user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
            project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
            project_role : projectRole,
            invited_by : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
        })
        .returningAll()
        .executeTakeFirstOrThrow()

}

export const addMemberToProjects = async (
    userId : string,
    invitedBy : string,
    projectRole : EProjectRole,
    projects : string[],
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {
        await Promise.all( projects.map( async projectId => {
    
            await trx.insertInto( "project.project_members" )
                .values({
                    user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                    project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
                    project_role : projectRole,
                    invited_by : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
                })
                .returningAll()
                .executeTakeFirstOrThrow()

        } ) )
    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => {
            await query( trx )
        } )
    }


}

export const addMembersToProject = async (
    projectId : string,
    invitedBy : string,
    members : {
        user_id : string,
        role : EProjectRole
    }[],
    trx? : Transaction<DB>
) : Promise<TProjectMember[]> => {

    const query = async ( trx : Transaction<DB> ) => {
        
        trx.insertInto( "project.project_members" )
            .values( members.map( member => ({
                user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${member.user_id})`,
                project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
                project_role : member.role,
                invited_by : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
            }) ) )
            .returningAll()
            .executeTakeFirstOrThrow()

        return await getProjectMembersByTheirUserId(
            members.map( member => member.user_id ),
            projectId,
            trx
        )
    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const updateProjectCustomization = async (
    projectId : string,
    body : TUpdateProjectCustomizationRequestBody,
    trx? : Transaction<DB>
) : Promise<TProjectPrimitive> => {

    const query = async ( trx : Transaction<DB> ) : Promise<TProjectPrimitive> => {

        return await trx.updateTable( "project.project" )
            .$if( !!body.project_name, qb => qb.set( "project_name", body.project_name ) )
            .$if( !!body.project_abbreviation, qb => qb.set( "project_abbreviation", body.project_abbreviation ) )
            .$if( !!body.project_color, qb => qb.set( "project_color", body.project_color ) )
            .where( "project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .returning([
                "project_name",
                "project_abbreviation",
                "project_color",
                "created_at",
                "active",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
            ])
            .executeTakeFirstOrThrow()

    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const getProjectPrimitive = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TProjectPrimitive | undefined> => {
   
    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    return await queryBuilder
        .select([
            "project_name",
            "project_abbreviation",
            "project_color",
            "created_at",
            "active",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .where( "project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .executeTakeFirst()

}

export const updateProjectMemberRole = async (
    projectId : string,
    memberId : string,
    role : EProjectRole,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        await trx.updateTable( "project.project_members" )
            .set({
                project_role : role
            })
            .where( "project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${memberId})` )
            .executeTakeFirstOrThrow()

    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}