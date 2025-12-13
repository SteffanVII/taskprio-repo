import { PoolClient } from "pg";
import { databaseFunctionWrapper, EDatabaseFunction, getPoolClient } from "../../postgresql.js";
import { DB, TTask, TTaskboard, TTaskComment, TTaskPath, TTaskPrimitive, TUserAvailableTaskTodo, TUserAvailableTaskTodoByProject, TUserTaskTodoState } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql, Transaction } from "kysely";
import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";

export const getTaskLastDisplayOrder = async (
    taskSectionId : string,
    trx? : Transaction<DB>
) : Promise<number> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" )

    const lastDisplayOrder = await queryBuilder
        .select( sql<number>`COALESCE(MAX(display_order), -99)`.as( "last_display_order" ) )
        .where( "taskboard.task.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})` )
        .executeTakeFirstOrThrow()

    return lastDisplayOrder.last_display_order;

}

export const getTask = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TTask | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" )

    const task = await queryBuilder
        .leftJoin( "taskboard.task_assignee", "taskboard.task.task_id", "taskboard.task_assignee.task_id" )
        .leftJoin( "tp_user.user", "taskboard.task_assignee.user_id", "tp_user.user.user_id" )
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .leftJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`.as( "task_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.created_by)`.as( "created_by" ),
            "taskboard.task.task_title",
            "taskboard.task.task_description",
            "taskboard.task.task_estimate",
            "taskboard.task.display_order",
            "taskboard.task.created_at",
            "taskboard.task.last_modified",
            "taskboard.task.in_trash",
            "taskboard.task.task_deadline",
            "taskboard.task.task_depth",
            "taskboard.task.task_board_id",
            "project.project.project_color",
            "project.project.project_abbreviation",
            eb.fn.coalesce(
                eb.fn.jsonAgg(
                    jsonBuildObject({
                        "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_assignee.user_id)`,
                        "firstname" : eb.ref( "tp_user.user.firstname" ),
                        "lastname" : eb.ref( "tp_user.user.lastname" )
                    }),
                ).filterWhere( "tp_user.user.user_id", "is not", null ),
                sql<[]>`'[]'`
            ).as( "assignees" ),
            jsonArrayFrom(
                eb.selectFrom( "taskboard.task_time_log" )
                    .select([
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_time_log.task_time_log_id)`.as( "task_time_log_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_time_log.task_id)`.as( "task_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_time_log.user_id)`.as( "user_id" ),
                        "taskboard.task_time_log.time_spent",
                        "taskboard.task_time_log.created_at"
                    ])
                    .where( "taskboard.task_time_log.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
                    .where( "taskboard.task_time_log.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                    .orderBy( "taskboard.task_time_log.created_at", "desc" )
            ).as( "task_time_logs" ),
            jsonArrayFrom(
                eb.selectFrom( "taskboard.task_tag" )
                    .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
                    .select([
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                        "project.project_tags.tag_name",
                        "project.project_tags.tag_color"
                    ])
                    .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
            ).as( "tags" )
        ] )
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .groupBy([
            "taskboard.task.task_id",
            "taskboard.task.task_section_id",
            "taskboard.task.created_by",
            "taskboard.task.task_title",
            "taskboard.task.task_description",
            "taskboard.task.task_estimate",
            "taskboard.task.display_order",
            "taskboard.task.created_at",
            "taskboard.task.last_modified",
            "taskboard.task.in_trash",
            "taskboard.task.task_deadline",
            "taskboard.task.task_depth",
            "taskboard.task.task_board_id",
            "project.project.project_color",
            "project.project.project_abbreviation"
        ])
        .executeTakeFirst()

    return task;
    
}

export const getTaskPrimitive = async (
    taskId : string,
    trx? : Transaction<DB>
) : Promise<TTaskPrimitive | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" )

    return await queryBuilder
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .leftJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .select( eb => [
            "taskboard.task.task_title",
            "taskboard.task.task_description",
            "taskboard.task.task_estimate",
            "taskboard.task.task_deadline",
            "taskboard.task.display_order",
            "taskboard.task.created_at",
            "taskboard.task.last_modified",
            "taskboard.task.in_trash",
            "taskboard.task.task_depth",
            "taskboard.task.task_board_id",
            "project.project.project_abbreviation",
            "project.project.project_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`.as( "task_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.created_by)`.as( "created_by" )
        ])
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .executeTakeFirst()

}

export const getTaskPath = databaseFunctionWrapper(
    async (
        client,
        taskId : string
    ) : Promise<TTaskPath | undefined> => {
        const path = await client.query({
            text : `--sql
                SELECT
                    public.uuid_to_base64(wp.workspace_id) as workspace_id,
                    public.uuid_to_base64(p.project_id) as project_id,
                    public.uuid_to_base64(tb.task_board_id) as task_board_id,
                    public.uuid_to_base64(ts.task_section_id) as task_section_id
                FROM taskboard."task" t
                JOIN taskboard."task_section" ts ON t.task_section_id = ts.task_section_id
                JOIN taskboard."task_board" tb ON ts.task_board_id = tb.task_board_id
                JOIN project."project" p ON tb.project_id = p.project_id
                JOIN project."workspace_projects" wp ON p.project_id = wp.project_id
                WHERE t.task_id = public.base64_to_uuid($1);
            `,
            values : [ taskId ]
        })
        return path.rows[0]
    }
)

/**
 * 
 * @param workspaceId workspace_id in UUID or Base64
 * @param userId user_id in UUID or Base64
 * @param trx transaction to use
 * @returns TUserAssignedTaskByProject[] The user assigned tasks workspace wide.
 */
export const getTasksAssignedToUserByWorkspaceId = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>,
    addTodoState? : boolean
) : Promise<TUserAvailableTaskTodoByProject[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    const returnValue = await queryBuilder
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        // .innerJoin( "project.project", "project.project.project_id", "project.project.project_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_board_id", "taskboard.task_board.task_board_id" )
        .leftJoin( "taskboard.task", "taskboard.task.task_section_id", "taskboard.task_section.task_section_id" )
        .innerJoin( "taskboard.task_assignee", "taskboard.task_assignee.task_id", "taskboard.task.task_id" )
        .leftJoin( "taskboard.task_todo_state", "taskboard.task_todo_state.task_id", "taskboard.task.task_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as( "project_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as( "created_by" ),
            "project.project.project_name",
            "project.project.project_abbreviation",
            "project.project.project_color",
            eb.fn.coalesce(
                eb.fn.jsonAgg(
                    jsonBuildObject({
                        "task_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`,
                        "task_title" : eb.ref( "taskboard.task.task_title" ),
                        "task_deadline" : eb.ref( "taskboard.task.task_deadline" ),
                        "task_depth" : eb.ref( "taskboard.task.task_depth" ),
                        "project_abbreviation" : eb.ref( "project.project.project_abbreviation" ),
                        "project_color" : eb.ref( "project.project.project_color" ),
                        ...(addTodoState ? {
                            "display_order" : eb.ref( "taskboard.task_todo_state.display_order" ),
                            "active" : eb.ref( "taskboard.task_todo_state.active" ),
                            "current_work_time" : eb.ref( "taskboard.task_todo_state.current_work_time" ),
                            "work_time_goal" : eb.ref( "taskboard.task_todo_state.work_time_goal" )
                        } : {}),
                        "tags" : jsonArrayFrom(
                            eb.selectFrom( "taskboard.task_tag" )
                                .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
                                .select([
                                    "project.project_tags.tag_name",
                                    "project.project_tags.tag_color",
                                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" )
                                ])
                                .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
                        )
                    })
                )
                .orderBy( "taskboard.task.created_at", "desc" )
                .filterWhere( "taskboard.task.task_id", "is not", null )
                .filterWhere( "taskboard.task.in_trash", "=", false ),
                sql<TUserAvailableTaskTodo[]>`'[]'`
            ).as( "tasks" ),
            eb.fn.coalesce(
                jsonArrayFrom(
                    eb.selectFrom( "taskboard.task_board" )
                        .select([
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as( "task_board_id" ),
                            "taskboard.task_board.task_board_name"
                        ])
                        .whereRef( "taskboard.task_board.project_id", "=", "project.project.project_id" )
                        .where( "taskboard.task_board.inactive", "=", false )
                ),
                sql<Pick<TTaskboard, "task_board_id" | "task_board_name">[]>`'[]'`
            ).as( "taskboards" )
        ] )
        .where( eb => eb.or([
            eb("taskboard.task_todo_state.active", "=", false),
            eb("taskboard.task_todo_state.active", "is", null)
        ]) )
        .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .where( "taskboard.task_assignee.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
        .where( "taskboard.task_board.inactive", "=", false )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .groupBy([
            "project.project.project_id",
            "project.project.workspace_id",
            "project.project.created_by",
            "project.project.project_name",
            "project.project.project_color",
            "project.project.project_abbreviation"
        ])
        .execute()

    return returnValue;

}

export const getTasksAssignedToUserByProjectId = async (
    projectId : string,
    userId : string,
    filters? : {
        search? : string,
        taskboards? : string[]
    },
    addTodoState? : boolean,
    trx? : Transaction<DB>
) : Promise<TUserAvailableTaskTodoByProject> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    const returnValue = await queryBuilder
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_board_id", "taskboard.task_board.task_board_id" )
        .leftJoin( "taskboard.task", "taskboard.task.task_section_id", "taskboard.task_section.task_section_id" )
        .innerJoin( "taskboard.task_assignee", "taskboard.task_assignee.task_id", "taskboard.task.task_id" )
        .leftJoin( "taskboard.task_todo_state", "taskboard.task_todo_state.task_id", "taskboard.task.task_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as( "project_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as( "workspace_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.created_by)`.as( "created_by" ),
            "project.project.project_name",
            "project.project.project_abbreviation",
            "project.project.project_color",
            eb.fn.coalesce(
                eb.fn.jsonAgg(
                    jsonBuildObject({
                        "task_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`,
                        "task_title" : eb.ref( "taskboard.task.task_title" ),
                        "task_deadline" : eb.ref( "taskboard.task.task_deadline" ),
                        "task_depth" : eb.ref( "taskboard.task.task_depth" ),
                        "project_abbreviation" : eb.ref( "project.project.project_abbreviation" ),
                        "project_color" : eb.ref( "project.project.project_color" ),
                        ...(addTodoState ? {
                            "display_order" : eb.ref( "taskboard.task_todo_state.display_order" ),
                            "active" : eb.ref( "taskboard.task_todo_state.active" ),
                            "current_work_time" : eb.ref( "taskboard.task_todo_state.current_work_time" ),
                            "work_time_goal" : eb.ref( "taskboard.task_todo_state.work_time_goal" )
                        } : {}),
                        "tags" : jsonArrayFrom(
                            eb.selectFrom( "taskboard.task_tag" )
                                .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
                                .select([
                                    "project.project_tags.tag_name",
                                    "project.project_tags.tag_color",
                                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" )
                                ])
                                .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
                        )
                    })
                )
                .orderBy( "taskboard.task.created_at", "desc" )
                .filterWhere( "taskboard.task.task_id", "is not", null )
                .filterWhere( "taskboard.task.in_trash", "=", false )
                .$call( aggBuilder => {
                    if ( filters.taskboards && filters.taskboards.length > 0 ) {
                        return aggBuilder.filterWhere( "taskboard.task_board.task_board_id", "=", eb.fn.any( sql<string[]>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID_ARRAY)}(${filters.taskboards})` ))
                    }
                    return aggBuilder
                } )
                ,
                sql<TUserAvailableTaskTodo[]>`'[]'`
            ).as( "tasks" ),
            eb.fn.coalesce(
                jsonArrayFrom(
                    eb.selectFrom( "taskboard.task_board" )
                        .select([
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as( "task_board_id" ),
                            "taskboard.task_board.task_board_name"
                        ])
                        .whereRef( "taskboard.task_board.project_id", "=", "project.project.project_id" )
                        .where( "taskboard.task_board.inactive", "=", false )
                ),
                sql<Pick<TTaskboard, "task_board_id" | "task_board_name">[]>`'[]'`
            ).as( "taskboards" )
        ] )
        .where( eb => eb.or([
            eb("taskboard.task_todo_state.active", "=", false),
            eb("taskboard.task_todo_state.active", "is", null)
        ]) )
        .where( "project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "taskboard.task_assignee.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
        .where( "taskboard.task_board.inactive", "=", false )
        .where( "workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .groupBy([
            "project.project.project_id",
            "project.project.workspace_id",
            "project.project.created_by",
            "project.project.project_name",
            "project.project.project_color",
            "project.project.project_abbreviation"
        ])
        .executeTakeFirst()

    return returnValue;

}

/**
 * Get the user task todo state
 * @param workspaceId workspace_id in UUID or Base64
 * @param userId user_id in UUID or Base64
 * @param trx transaction to use
 * @returns TUserAssignedTasksState[] The user assigned tasks todo state.
 */
export const getUserTaskTodoState = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TUserTaskTodoState[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project" ) : taskprioKysely.selectFrom( "project.project" )

    return await queryBuilder
        .innerJoin( "workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id" )
        .innerJoin( "tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id" )
        .innerJoin( "project.project_members", "project.project_members.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.project_id", "project.project.project_id" )
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_board_id", "taskboard.task_board.task_board_id" )
        .leftJoin( "taskboard.task", "taskboard.task.task_section_id", "taskboard.task_section.task_section_id" )
        .leftJoin( "taskboard.task_todo_state", "taskboard.task_todo_state.task_id", "taskboard.task.task_id" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`.as( "task_id" ),
            "taskboard.task.task_title",
            "taskboard.task.task_deadline",
            "taskboard.task.task_depth",
            jsonArrayFrom(
                eb.selectFrom( "taskboard.task_tag" )
                    .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
                    .select([
                        "project.project_tags.tag_name",
                        "project.project_tags.tag_color",
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" )
                    ])
                    .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
            ).as( "tags" ),
            jsonArrayFrom(
                eb.selectFrom( "taskboard.task_todo_timer" )
                    .selectAll()
                    .select([
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.workspace_id)`.as( "workspace_id" )
                    ])
                    .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
                    .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                    .orderBy( "taskboard.task_todo_timer.start", "desc" )
            ).as( "timers" ),
            "taskboard.task_todo_state.work_time_goal",
            "taskboard.task_todo_state.current_work_time",
            "taskboard.task_todo_state.display_order",
            "taskboard.task_todo_state.active",
            "project.project.project_abbreviation",
            "project.project.project_color"
        ])
        .where( "taskboard.task.task_id", "is not", null )
        .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .where( "taskboard.task_todo_state.active", "=", true )
        .where( "taskboard.task_board.inactive", "=", false )
        .orderBy( "taskboard.task_todo_state.display_order", "desc" )
        .groupBy([
            "taskboard.task.task_id",
            "taskboard.task.task_title",
            "taskboard.task.task_deadline",
            "taskboard.task.task_depth",
            "taskboard.task_todo_state.work_time_goal",
            "taskboard.task_todo_state.current_work_time",
            "taskboard.task_todo_state.display_order",
            "taskboard.task_todo_state.active",
            "project.project.project_abbreviation",
            "project.project.project_color"
        ])
        .execute()

}

export const getTasksTodoLastDisplayOrder = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<number> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_todo_state" ) : taskprioKysely.selectFrom( "taskboard.task_todo_state" )

    return (await queryBuilder
        .innerJoin( "taskboard.task", "taskboard.task.task_id", "taskboard.task_todo_state.task_id" )
        .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .select( sql<number>`COALESCE(MAX(taskboard.task_todo_state.display_order), -99)`.as( "last_display_order" ) )
        .where( "taskboard.task.task_id", "is not", null )
        .where( "taskboard.task.in_trash", "is", false )
        .where( "taskboard.task_todo_state.active", "=", true )
        .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        .executeTakeFirstOrThrow()).last_display_order       
}

/**
 * Get the task comments
 * @param taskId task_id in UUID or Base64
 * @param trx transaction to use
 * @returns TTaskComment[] The task comments.
 */
export const getTaskComments = async (
    taskId : string,
    trx? : Transaction<DB>
) : Promise<TTaskComment[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_comment" ) : taskprioKysely.selectFrom( "taskboard.task_comment" )

    return (await queryBuilder
        .leftJoin( "tp_user.user as main_user", "main_user.user_id", "taskboard.task_comment.user_id" )
        .leftJoin( "taskboard.task_comment as replying_to_task_comment", "replying_to_task_comment.task_comment_id", "taskboard.task_comment.replying_to_task_comment_id" )
        .leftJoin( "tp_user.user as reply_user", "reply_user.user_id", "replying_to_task_comment.user_id" )
        .select( eb => [
            "taskboard.task_comment.task_comment_id",
            "taskboard.task_comment.comment_content",
            "taskboard.task_comment.created_at",
            "taskboard.task_comment.edited_at",
            jsonBuildObject({
                "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(main_user.user_id)`,
                "firstname" : eb.ref( "main_user.firstname" ),
                "lastname" : eb.ref( "main_user.lastname" ),
                "email" : eb.ref( "main_user.email" )
            }).as( "user" ),
            eb.case()
                .when( "replying_to_task_comment.task_comment_id", "is not", null )
                .then(
                    jsonBuildObject({
                        "task_comment_id" : eb.ref( "replying_to_task_comment.task_comment_id" ),
                        "comment_content" : eb.ref( "replying_to_task_comment.comment_content" ),
                        "created_at" : eb.ref( "replying_to_task_comment.created_at" ),
                        "edited_at" : eb.ref( "replying_to_task_comment.edited_at" ),
                        "user" : jsonBuildObject({
                            "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(reply_user.user_id)`,
                            "firstname" : eb.ref( "reply_user.firstname" ),
                            "lastname" : eb.ref( "reply_user.lastname" ),
                            "email" : eb.ref( "reply_user.email" )
                        })
                    })    
                ).else(
                    sql<null>`null`
                ).end().as( "replying_to_task_comment")
        ] )
        .where( "taskboard.task_comment.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .execute())


}

export const getTaskComment = async (
    taskCommentId : string,
    trx? : Transaction<DB>
) : Promise<TTaskComment | undefined>=> {

    const queryBuilder = trx ? trx.selectFrom("taskboard.task_comment") : taskprioKysely.selectFrom("taskboard.task_comment")

    return (await queryBuilder
        .leftJoin( "tp_user.user as main_user", "main_user.user_id", "taskboard.task_comment.user_id" )
        .leftJoin( "taskboard.task_comment as replying_to_task_comment", "replying_to_task_comment.task_comment_id", "taskboard.task_comment.replying_to_task_comment_id" )
        .leftJoin( "tp_user.user as reply_user", "reply_user.user_id", "replying_to_task_comment.user_id" )
        .select( eb => [
            "taskboard.task_comment.task_comment_id",
            "taskboard.task_comment.comment_content",
            "taskboard.task_comment.created_at",
            "taskboard.task_comment.edited_at",
            jsonBuildObject({
                "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(main_user.user_id)`,
                "firstname" : eb.ref( "main_user.firstname" ),
                "lastname" : eb.ref( "main_user.lastname" ),
                "email" : eb.ref( "main_user.email" )
            }).as( "user" ),
            eb.case()
                .when( "replying_to_task_comment.task_comment_id", "is not", null )
                .then(
                    jsonBuildObject({
                        "task_comment_id" : eb.ref( "replying_to_task_comment.task_comment_id" ),
                        "comment_content" : eb.ref( "replying_to_task_comment.comment_content" ),
                        "created_at" : eb.ref( "replying_to_task_comment.created_at" ),
                        "edited_at" : eb.ref( "replying_to_task_comment.edited_at" ),
                        "user" : jsonBuildObject({
                            "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(reply_user.user_id)`,
                            "firstname" : eb.ref( "reply_user.firstname" ),
                            "lastname" : eb.ref( "reply_user.lastname" ),
                            "email" : eb.ref( "reply_user.email" )
                        })
                    })    
                ).else(
                    sql<null>`null`
                ).end().as( "replying_to_task_comment")
        ] )
        .where( "taskboard.task_comment.task_comment_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskCommentId})` )
        .executeTakeFirstOrThrow())

}

export const getTaskboardTrashTasks = async (
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<TTaskPrimitive[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task" ) : taskprioKysely.selectFrom( "taskboard.task" );

    return await queryBuilder
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
        .leftJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task.task_board_id" )
        .leftJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
        .selectAll()
        .select([
            "project.project.project_color",
            "project.project.project_abbreviation"
        ])
        .where( "taskboard.task.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
        .where( "taskboard.task.in_trash", "=", true )
        .execute()

}