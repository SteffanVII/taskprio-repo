import { DB, TTaskTodoStateSnapshotTimer, TTaskTodoStateSnapshotWithTimers, TTaskTodoTimer, TUserTaskTodoState } from "@repo/taskprio-types";
import { Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql } from "kysely";
import { EDatabaseFunction } from "../../postgresql.js";
import { TSessionHistoryWithTaskTodoStateSnapshots } from "@repo/taskprio-types";
import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";



// export const getUserTopTodoTask = async (
//     userId : string,
//     trx? : Transaction<DB>
// ) : Promise<TUserTaskTodoState | undefined> => {

//     const queryBuilder = trx ? trx.selectFrom( "taskboard.task_todo_state" ) : taskprioKysely.selectFrom( "taskboard.task_todo_state" );

//     return await queryBuilder
    

// }

export const getAllActiveTaskTodoTimers = async (
    trx? : Transaction<DB>
) : Promise<TTaskTodoTimer[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_todo_timer" ) : taskprioKysely.selectFrom( "taskboard.task_todo_timer" );

    return await queryBuilder
        .where( "taskboard.task_todo_timer.stop", "is", null)
        .where( "taskboard.task_todo_timer.task_time_log_id", "is", null )
        .selectAll()
        .execute()

}

export const getActiveTaskTodoTimers = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TTaskTodoTimer[]> => {

    const queryBuilder = ( trx ?? taskprioKysely ).selectFrom( "taskboard.task_todo_timer" )
    
    return queryBuilder
        .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .where( "taskboard.task_todo_timer.task_time_log_id", "is", null )
        .select([
            "taskboard.task_todo_timer.last_seen",
            "taskboard.task_todo_timer.start",
            "taskboard.task_todo_timer.stop",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_id)`.as("task_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_time_log_id)`.as("task_time_log_id")
        ])
        .execute()
}

export const getWorkspaceSessionHistories = async (
    workspaceId : string,
    userIds? : string[],
    dateRange? : string[],
    trx? : Transaction<DB>
) : Promise<TSessionHistoryWithTaskTodoStateSnapshots[]> => {
    
    const queryBuilder = (trx ?? taskprioKysely)

    let query = queryBuilder.selectFrom( "taskboard.task_todo_session_history" )
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_session_history.task_todo_session_history_id)`.as("task_todo_session_history_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_session_history.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_session_history.user_id)`.as("user_id"),
            "taskboard.task_todo_session_history.created_at",
            jsonArrayFrom(
                eb.selectFrom( "taskboard.task_todo_state_snapshot" )
                    .leftJoin( "taskboard.task_todo_state_snapshot_timer", "taskboard.task_todo_state_snapshot_timer.task_todo_state_snapshot_id", "taskboard.task_todo_state_snapshot.task_todo_state_snapshot_id" )
                    .select( eb2 => [
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot.task_todo_session_history_id)`.as( "task_todo_session_history_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot.task_todo_state_snapshot_id)`.as( "task_todo_state_snapshot_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot.task_id)`.as( "task_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot.user_id)`.as( "user_id" ),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot.project_id)`.as( "project_id" ),
                        "taskboard.task_todo_state_snapshot.work_time_goal",
                        "taskboard.task_todo_state_snapshot.created_at",
                        "taskboard.task_todo_state_snapshot.task_title",
                        "taskboard.task_todo_state_snapshot.task_depth",
                        "taskboard.task_todo_state_snapshot.project_name",
                        "taskboard.task_todo_state_snapshot.project_abbreviation",
                        "taskboard.task_todo_state_snapshot.project_color",
                        "taskboard.task_todo_state_snapshot.completed",
                        eb2.fn.coalesce(
                            eb2.fn.jsonAgg(
                                jsonBuildObject({
                                    "task_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot_timer.task_id)`,
                                    "workspace_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot_timer.workspace_id)`,
                                    "user_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot_timer.user_id)`,
                                    "task_time_log_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot_timer.task_time_log_id)`,
                                    "task_todo_state_snapshot_id" : sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_state_snapshot_timer.task_todo_state_snapshot_id)`,
                                    "start" : eb2.ref("taskboard.task_todo_state_snapshot_timer.start"),
                                    "stop" : eb2.ref("taskboard.task_todo_state_snapshot_timer.stop"),
                                    "last_seen" : eb2.ref("taskboard.task_todo_state_snapshot_timer.last_seen"),
                                })
                            )
                            .orderBy( "taskboard.task_todo_state_snapshot_timer.start", "desc" )
                            .filterWhereRef( "taskboard.task_todo_state_snapshot_timer.task_todo_state_snapshot_id", "=", eb2.ref("taskboard.task_todo_state_snapshot.task_todo_state_snapshot_id") )
                            ,
                            sql<TTaskTodoStateSnapshotTimer[]>`'[]'`
                        )
                        .as("timers")
                    ])
                    .whereRef( "taskboard.task_todo_state_snapshot.task_todo_session_history_id", "=", eb.ref( "taskboard.task_todo_session_history.task_todo_session_history_id" ) )
                    .whereRef( "taskboard.task_todo_state_snapshot.user_id", "=", eb.ref( "taskboard.task_todo_session_history.user_id" ) )
                    .groupBy([
                        "taskboard.task_todo_state_snapshot.task_todo_session_history_id",
                        "taskboard.task_todo_state_snapshot.task_todo_state_snapshot_id",
                        "taskboard.task_todo_state_snapshot.task_id",
                        "taskboard.task_todo_state_snapshot.user_id",
                        "taskboard.task_todo_state_snapshot.project_id",
                        "taskboard.task_todo_state_snapshot.work_time_goal",
                        "taskboard.task_todo_state_snapshot.created_at",
                        "taskboard.task_todo_state_snapshot.task_title",
                        "taskboard.task_todo_state_snapshot.task_depth",
                        "taskboard.task_todo_state_snapshot.project_name",
                        "taskboard.task_todo_state_snapshot.project_abbreviation",
                        "taskboard.task_todo_state_snapshot.project_color",
                        "taskboard.task_todo_state_snapshot.completed"
                    ])
            ).as( "snapshots" )
        ] )
        .orderBy( "taskboard.task_todo_session_history.created_at", "desc" )
        .groupBy([
            "taskboard.task_todo_session_history.task_todo_session_history_id",
            "taskboard.task_todo_session_history.workspace_id",
            "taskboard.task_todo_session_history.user_id",
            "taskboard.task_todo_session_history.created_at"
        ])
        .where( "taskboard.task_todo_session_history.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)

        if ( userIds && userIds.length > 0 ) {
            query = query.where( eb => eb("taskboard.task_todo_session_history.user_id", "=", eb.fn.any(sql<string[]>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID_ARRAY)}(${userIds})`)) )
        }

        if ( dateRange && dateRange.length > 1 ) {
            console.log(dateRange);
            query = query.where( eb => eb.and([
                eb("taskboard.task_todo_session_history.created_at", "<=", dateRange[0]),
                eb("taskboard.task_todo_session_history.created_at", ">=", dateRange[1]),
            ]) )
        }

    return await query.execute();

}