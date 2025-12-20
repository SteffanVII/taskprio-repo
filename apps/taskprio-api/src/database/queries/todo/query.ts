import { DB, TTaskTodoTimer, TUserTaskTodoState } from "@repo/taskprio-types";
import { Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql } from "kysely";
import { EDatabaseFunction } from "../../postgresql.js";



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