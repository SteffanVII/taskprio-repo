import { DB, TStartOrStopTaskTodoTimerResponseData, TTaskTodoTimer } from "@repo/taskprio-types";
import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { logTaskTime } from "../task/mutation.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import dayjs from "dayjs";
import { getActiveTaskTodoTimers } from "./query.js";

export const finishTaskTodoSession = async (
    workspaceId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        const taskTodoStatesQuery =  trx.selectFrom( "taskboard.task_todo_state" )
            .innerJoin( "taskboard.task", "taskboard.task.task_id", "taskboard.task_todo_state.task_id" )
            .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id")
            .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
            .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id")
            .leftJoin( "taskboard.task_todo_timer", "taskboard.task_todo_timer.task_id", "taskboard.task_todo_state.task_id" )
            .select( eb => [
                "taskboard.task_todo_state.task_id",
                "taskboard.task_todo_state.current_work_time",
                "taskboard.task_todo_state.work_time_goal",
                "taskboard.task_todo_state.completed",
                "taskboard.task.task_title",
                "taskboard.task.task_depth",
                "project.project.project_name",
                "project.project.project_abbreviation",
                "project.project.project_color",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.project_id)`.as("project_id"),
                eb.fn.coalesce(
                    eb.fn.jsonAgg(
                        jsonBuildObject({
                          start : eb.ref( "taskboard.task_todo_timer.start" ),  
                          stop : eb.ref( "taskboard.task_todo_timer.stop" ),  
                          last_seen : eb.ref( "taskboard.task_todo_timer.last_seen" ),  
                        })
                    )
                    .filterWhere( "taskboard.task_todo_timer.task_time_log_id", "is", null )
                    .orderBy( "taskboard.task_todo_timer.start", "desc" ),
                    sql<Pick<TTaskTodoTimer, "start" | "stop" | "last_seen">[]>`'[]'`
                    // eb.val<Pick<TTaskTodoTimer, "start" | "stop" | "last_seen">[]>([])
                ).as( "timers" )
            ] )
            .where( "taskboard.task_todo_state.active", "=", true )
            .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .groupBy([
                "taskboard.task_todo_state.task_id",
                "taskboard.task_todo_state.current_work_time",
                "taskboard.task_todo_state.work_time_goal",
                "taskboard.task_todo_state.completed",
                "taskboard.task.task_title",
                "taskboard.task.task_depth",
                "project.project.project_id",
                "project.project.project_name",
                "project.project.project_abbreviation",
                "project.project.project_color"
            ])

        // Get active todo task state and related timers
        const taskTodoStates = await taskTodoStatesQuery.execute()

        // Create session history
        const createdSessionHistory = await trx.insertInto( "taskboard.task_todo_session_history" )
            .values({
                workspace_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`,
                user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
            })
            .returningAll()
            .executeTakeFirst()

        
        // Iterate to all the todo states
        await Promise.all( taskTodoStates.map( async (todoState) => {

            const timers = todoState.timers;

            const totalWorkTime = timers.reduce( (acc, curr) => {
                const start = dayjs.utc( curr.start )
                const stop = curr.stop === null ? dayjs.utc() : dayjs.utc(curr.stop)
                const diff = stop.diff( start, "seconds" )
                return acc + diff
            }, 0 )

            // Create a snapshot of the todo task state
            const createdTaskTodoStateSnapshot = await trx.insertInto( "taskboard.task_todo_state_snapshot" )
                .values({
                    task_todo_session_history_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdSessionHistory.task_todo_session_history_id})`,
                    task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.task_id})`,
                    user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                    project_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.project_id})`,
                    work_time_goal : todoState.work_time_goal,
                    completed : todoState.completed,

                    task_title : todoState.task_title,
                    task_depth : todoState.task_depth,

                    project_name : todoState.project_name,
                    project_abbreviation : todoState.project_abbreviation,
                    project_color : todoState.project_color
                })
                .returningAll()
                .executeTakeFirst()

            if ( todoState.completed ) {
                await trx.updateTable( "taskboard.task_todo_state" )
                    .set({
                        completed : false,
                        active : false
                    })
                    .where( "taskboard.task_todo_state.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.task_id})` )
                    .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                    .where( "taskboard.task_todo_state.active", "=", true )
                    .executeTakeFirst()
            }

            if ( totalWorkTime > 0 ) {

                // Create task time log
                const loggedTime = await logTaskTime(
                    todoState.task_id,
                    userId,
                    Math.floor(totalWorkTime / 60),
                    trx
                )

                console.log(timers.length);
                
                // Create a copy of all the timers related to the todo state and then attach it to the todo state snapshot
                await Promise.all( timers.map( async timer => {

                    await trx.insertInto( "taskboard.task_todo_state_snapshot_timer" )
                        .values({
                            task_todo_state_snapshot_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdTaskTodoStateSnapshot.task_todo_state_snapshot_id})`,
                            workspace_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`,
                            user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                            task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.task_id})`,
                            task_time_log_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${loggedTime.task_time_log_id})`,
                            last_seen : timer.last_seen,
                            start : timer.start,
                            stop : timer.stop
                        })
                        .execute()

                } ) )

                // Attach the task time log id to all timers related to the task todo state
                // This will group the timers by the task time log
                await trx.updateTable( "taskboard.task_todo_timer" )
                    .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.task_id})` )
                    .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                    .set({
                        "task_time_log_id" : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${loggedTime.task_time_log_id})`
                    })
                    .executeTakeFirstOrThrow()
            }
        } ) )

    }

    if ( trx ) {
        await query( trx );
    } else {
        await taskprioKysely.transaction().execute( async trx => {
            await query( trx );
        } )
    }

    
}

export const startOrStopTaskTimer = async (
    userId : string,
    taskId : string,
    trx? : Transaction<DB>
) : Promise<TStartOrStopTaskTodoTimerResponseData> => {

    const query = async ( trx : Transaction<DB> ) => {

        const latestTimer = await trx.selectFrom( "taskboard.task_todo_timer" )
            .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .orderBy( "taskboard.task_todo_timer.start", "desc" )
            .select([
                "taskboard.task_todo_timer.start",
                "taskboard.task_todo_timer.stop"
            ])
            .executeTakeFirst()

        // Create a new timer if the latest timer is not running or there is no timer yet for the task todo
        if ( (latestTimer && latestTimer.start && latestTimer.stop !== null) || !latestTimer ) {
            return await trx.insertInto( "taskboard.task_todo_timer" )
                .columns([
                    "task_id",
                    "user_id",
                    "workspace_id"
                ])
                .expression( eb => 
                    eb.selectFrom( "taskboard.task" )
                        .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task.task_board_id" )
                        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
                        .select([
                            eb.val(sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`).as("task_id"),
                            eb.val(sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`).as("user_id"),
                            "project.project.workspace_id"
                        ])
                        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                )
                .returning([
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_id)`.as("task_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.user_id)`.as("user_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.workspace_id)`.as("workspace_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_time_log_id)`.as("task_time_log_id"),
                    sql<string>`taskboard.task_todo_timer.start::text`.as("start"),
                    sql<string>`taskboard.task_todo_timer.stop::text`.as("stop"),
                    sql<string>`taskboard.task_todo_timer.last_seen::text`.as("last_seen")
                ])
                .executeTakeFirstOrThrow()
        } else {
            return await trx.updateTable( "taskboard.task_todo_timer" )
                .where( "taskboard.task_todo_timer.stop", "is", null )
                .where( "taskboard.task_todo_timer.task_time_log_id", "is", null )
                .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .set({
                    stop : sql.raw("CURRENT_TIMESTAMP"),
                    last_seen : sql.raw("CURRENT_TIMESTAMP")
                })
                .returning([
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_id)`.as("task_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.user_id)`.as("user_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.workspace_id)`.as("workspace_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_time_log_id)`.as("task_time_log_id"),
                    "taskboard.task_todo_timer.start",
                    "taskboard.task_todo_timer.stop",
                    "taskboard.task_todo_timer.last_seen",
                ])
                .executeTakeFirstOrThrow()
        }

    }

    if ( trx ) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query(trx) )
    }

}

export const updateTaskTodoTimerLastSeen = async (
    taskId : string,
    userId : string,
    workspaceId : string,
    trx? : Transaction<DB>
) : Promise<TTaskTodoTimer> => {

    const query = async ( trx : Transaction<DB> ) => {
        return await trx.updateTable( "taskboard.task_todo_timer" )
            .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "taskboard.task_todo_timer.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "taskboard.task_todo_timer.stop", "is", null )
            .where( "taskboard.task_todo_timer.task_time_log_id", "is", null )
            .set({
                last_seen : sql.raw("CURRENT_TIMESTAMP")
            })
            .returning([
                sql<string>`taskboard.task_todo_timer.last_seen::text`.as("last_seen"),
                "taskboard.task_todo_timer.start",
                "taskboard.task_todo_timer.stop",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_time_log_id)`.as("task_time_log_id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.task_id)`.as("task_id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.user_id)`.as("user_id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_todo_timer.workspace_id)`.as("workspace_id"),
            ])
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query(trx) )
    }

}

export const commitActiveTaskTodo = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        const timers = await getActiveTaskTodoTimers(
            taskId,
            userId,
            trx
        )

        const totalWorkTime = timers.reduce( (acc, curr) => {
            const start = dayjs.utc( curr.start )
            const stop = curr.stop === null ? dayjs.utc() : dayjs.utc(curr.stop)
            const diff = stop.diff( start, "seconds" )
            return acc + diff
        }, 0 )

        console.log(totalWorkTime);

        if ( totalWorkTime > 0 ) {
            const loggedTime = await logTaskTime(
                taskId,
                userId,
                Math.floor(totalWorkTime / 60),
                trx
            )
            await trx.updateTable( "taskboard.task_todo_timer" )
                .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .where( "taskboard.task_todo_timer.task_time_log_id", "is", null )
                .set({
                    task_time_log_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${loggedTime.task_time_log_id})`
                })
                .executeTakeFirstOrThrow()
        }

        await trx.updateTable( "taskboard.task_todo_state" )
            .set({
                active : false
            })
            .where( "taskboard.task_todo_state.active", "=", true )
            .where( "taskboard.task_todo_state.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query(trx) )
    }

}

export const markActiveTodoAsComplete = async (
    taskId : string,
    userId : string,
    completed : boolean,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {
        await trx.updateTable( "taskboard.task_todo_state" )
            .where( "taskboard.task_todo_state.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "taskboard.task_todo_state.active", "=", true )
            .set({
                completed
            })
            .executeTakeFirst()
    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx => query( trx ) )
    }

}