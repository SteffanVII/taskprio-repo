import { PoolClient } from "pg";
import { databaseFunctionWrapper, EDatabaseFunction, getPoolClient, getPostgrePool } from "../../postgresql.js";
import { DB, TProject, TProjectMember, TProjectWithUserAssignedTasks, TTaskboard } from "@repo/taskprio-types";
import { Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql } from "kysely";
import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";

export const getProject = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TProject | undefined> => {

    const query = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    const project = await query
    .leftJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
    .leftJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
    .select( (eb) => [
        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as( "workspace_id" ),
        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as( "project_id" ),
        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as( "created_by" ),
        "project.project.project_name",
        "project.project.created_at",
        "project.project.project_abbreviation",
        "project.project.project_color",
        "project.project.active",
        eb.fn.jsonAgg(
            jsonBuildObject({
                "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`,
                "email" : eb.ref( "tp_user.user.email" ),
                "firstname" : eb.ref( "tp_user.user.firstname" ),
                "lastname" : eb.ref( "tp_user.user.lastname" ),
                "project_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.project_id)`,
                "invited_by" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`,
                "project_role" : eb.ref( "project.project_members.project_role" ),
                "joined_at" : eb.ref( "project.project_members.joined_at" ),
                "is_active" : eb.ref( "project.project_members.is_active" ),
            })
        ).as( "project_members" ),
        jsonArrayFrom(
            eb.selectFrom( "project.project_tags" )
            .select([
                "tag_name",
                "tag_color",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.project_id)`.as( "project_id" )
            ])
            .where( "project.project_tags.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId}::text)` )
        ).as( "project_tags" )
    ] )
    .where( "project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
    .where( "tp_user.user.user_id", "is not", null )
    .groupBy( [
        "project.project.created_by",
        "project.project.workspace_id",
        "project.project.project_id",
        "project.project.project_name",
        "project.project.project_abbreviation",
        "project.project.project_color",
        "project.project.active"
    ] )
    .executeTakeFirst()

    return project;
}

export const getUserWorkspaceProjects = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProject[]> => {

    const query = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    const projects = await query
        .leftJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .leftJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select( (eb) => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as("created_by"),
            "project.project.created_at",
            "project.project.project_name",
            "project.project.project_abbreviation",
            "project.project.project_color",
            "project.project.active",
            eb.fn.jsonAgg(
                jsonBuildObject({
                    "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`,
                    "email" : eb.ref( "tp_user.user.email" ),
                    "firstname" : eb.ref( "tp_user.user.firstname" ),
                    "lastname" : eb.ref( "tp_user.user.lastname" ),
                    "project_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.project_id)`,
                    "invited_by" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`,
                    "project_role" : eb.ref( "project.project_members.project_role" ),
                    "joined_at" : eb.ref( "project.project_members.joined_at" ),
                    "is_active" : eb.ref( "project.project_members.is_active" ),
                })
            ).as( "project_members" ),
            jsonArrayFrom(
                eb.selectFrom( "project.project_tags" )
                .select([
                    "tag_name",
                    "tag_color",
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.project_id)`.as( "project_id" )
                ])
                .whereRef( "project.project_tags.project_id", "=", "project.project.project_id" )
                // .where( "project.project_tags.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(project_id)` )
            ).as( "project_tags" )
        ] )
        .where( eb => eb.and([
            eb("project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`),
            // If the requesting user exists in the project members table, then the project is returned
            eb.exists(
                eb.selectFrom( "project.project_members" )
                .whereRef( "project.project_members.project_id", "=", "project.project.project_id" )
                .where( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            ),
            eb("tp_user.user.user_id", "is not", null)
        ]) )
        .where( "project.project.active", "=", true )
        .where( "project.project_members.is_active", "=", true )
        .groupBy([
            "project.project.created_by",
            "project.project.workspace_id",
            "project.project.project_id",
            "project.project.project_name",
            "project.project.project_abbreviation",
            "project.project.project_color",
            "project.project.active"
        ])
        .execute()

    return projects
}

export const getUserProjects = databaseFunctionWrapper(
    async (
        client,
        userId : string
    ) :  Promise<TProject[]> => {
        const projects = await client.query({
            text : `--sql
                SELECT
                    public.uuid_to_base64(p.project_id) AS project_id,
                    p.project_name,
                    p.project_color,
                    json_agg(
                        json_build_object(
                            'user_id', public.uuid_to_base64(u.user_id),
                            'email', u.email,
                            'firstname', u.firstname,
                            'lastname', u.lastname,
                            'project_role', pm.project_role,
                            'joined_at', pm.joined_at,
                            'is_active', pm.is_active
                        )
                    ) as project_members
                FROM
                    project."project_members" pm
                JOIN
                    project."project" p ON pm.project_id = p.project_id
                JOIN
                    tp_user."user" u ON pm.user_id = u.user_id
                WHERE
                    pm.user_id = public.detect_and_convert_to_uuid($1)
                GROUP BY
                    p.project_id, p.project_name, p.project_color;
            `,
            values : [ userId ]
        })

        return projects.rows;
    }
)

export const getProjectMember = async (
    projectId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project_members" ) : taskprioKysely.selectFrom( "project.project_members" )

    const projectMember = await queryBuilder
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project.project_members.project_role",
            "project.project_members.joined_at",
            "project.project_members.is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( "project.project_members.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .executeTakeFirst()

    return projectMember;

}

export const getProjectMembersByTheirUserId = async (
    userIds : string[],
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project_members" ) : taskprioKysely.selectFrom( "project.project_members" )

    return await queryBuilder
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project.project_members.project_role",
            "project.project_members.joined_at",
            "project.project_members.is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( eb => eb.or(
            userIds.map( userId => eb( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` ) )
        ))
        .where( "project.project_members.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .execute()

}

export const getProjectMemberByTaskboardId = async (
    taskboardId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_board" ) : taskprioKysely.selectFrom( "taskboard.task_board" )

    const projectMember = await queryBuilder
        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project.project_members.project_role",
            "project.project_members.joined_at",
            "project.project_members.is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
        .where( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .executeTakeFirst()

    return projectMember;

}

export const getProjectMemberByTaskSectionId = async (
    taskSectionId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" )

    const projectMember = await queryBuilder
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project_role",
            "joined_at",
            "is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( "taskboard.task_section.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})` )
        .where( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .executeTakeFirst()

    return projectMember;

}

export const getProjectMemberByTaskId = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" )

    const projectMember = await queryBuilder
        .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project.project_members.project_role",
            "project.project_members.joined_at",
            "project.project_members.is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .where( "project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .executeTakeFirst()

    return projectMember;
}

export const getProjectMembers = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TProjectMember[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project_members" ) : taskprioKysely.selectFrom( "project.project_members" )

    return await queryBuilder
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select([
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.invited_by)`.as("invited_by"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_members.user_id)`.as("user_id"),
            "project.project_members.project_role",
            "project.project_members.joined_at",
            "project.project_members.is_active",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname"
        ])
        .where( "project.project_members.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "tp_user.user.user_id", "is not", null )
        .execute()

}

export const getWorkpaceInactiveProjectList = async (
    workspaceId : string,
    trx? : Transaction<DB>
) => {

    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    return queryBuilder
        .leftJoin( "taskboard.task_board", "taskboard.task_board.project_id", "project.project.project_id" )
        .leftJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .leftJoin( "tp_user.user", "tp_user.user.user_id", "project.project_members.user_id" )
        .select( eb => [
            "project.project.active",
            "project.project.created_at",
            "project.project.project_abbreviation",
            "project.project.project_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as( "project_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as( "created_by" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as( "workspace_id" ),
            "project.project.project_name",
            eb.fn.count( "taskboard.task_board.task_board_id" ).as( "taskboards" ),
            eb.fn.count( "project.project_members.user_id" ).filterWhere( "tp_user.user.user_id", "is not", null ).as( "members" )
        ] )
        .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .where( "project.project.active", "=", false )
        .groupBy([
            "project.project.active",
            "project.project.created_at",
            "project.project.project_abbreviation",
            "project.project.project_color",
            "project.project.project_name",
            "project.project.project_id",
            "project.project.created_by",
            "project.project.workspace_id"
        ])
        .execute()

}

export const getProjectListWithUserAssignedTasks = (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProjectWithUserAssignedTasks[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    return queryBuilder
        .leftJoin( "taskboard.task_board", "taskboard.task_board.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task", "taskboard.task.task_board_id", "taskboard.task_board.task_board_id" )
        .leftJoin( "taskboard.task_assignee", "taskboard.task_assignee.task_id", "taskboard.task.task_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as( "project_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as( "workspace_id" ),
            "project.project.project_name",
            "project.project.project_color",
            "project.project.project_abbreviation",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as( "created_by" ),
            eb.fn.coalesce(
                jsonArrayFrom(
                    eb.selectFrom("taskboard.task_board")
                        .select([
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as("task_board_id"),
                            "taskboard.task_board.task_board_name"
                        ])
                        .whereRef("taskboard.task_board.project_id", "=", "project.project.project_id")
                        .where("taskboard.task_board.inactive", "=", false)
                ),
                sql<Pick<TTaskboard, "task_board_id" | "task_board_name">[]>`'[]'`
            ).as("taskboards")
        ] )
        .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .where( "project.project.active", "=", true )
        .where( "taskboard.task_board.inactive", "=", false )
        .where( "taskboard.task.in_trash", "=", false )
        .where( "taskboard.task_assignee.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .groupBy([
            "project.project.project_id",
            "project.project.workspace_id",
            "project.project.project_name",
            "project.project.project_color",
            "project.project.project_abbreviation",
            "project.project.created_by",
        ])
        .execute()

}