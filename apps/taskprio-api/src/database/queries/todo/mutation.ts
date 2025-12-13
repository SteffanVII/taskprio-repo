import { DB, TStartOrStopTaskTodoTimerResponseData, TTaskTodoTimer } from "@repo/taskprio-types";
import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { logTaskTime, updateTaskTodoState } from "../task/mutation.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import dayjs from "dayjs";


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
                eb.fn.coalesce(
                    eb.fn.jsonAgg(
                        jsonBuildObject({
                          start : eb.ref( "taskboard.task_todo_timer.start" ),  
                          stop : eb.ref( "taskboard.task_todo_timer.stop" ),  
                        })
                    ).orderBy( "taskboard.task_todo_timer.start", "desc" ),
                    eb.val<Pick<TTaskTodoTimer, "start"| "stop">[]>([])
                ).as( "timers" )
            ] )
            .where( "taskboard.task_todo_state.active", "=", true )
            .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .groupBy([
                "taskboard.task_todo_state.task_id",
                "taskboard.task_todo_state.current_work_time"
            ])

        const taskTodoStates = await taskTodoStatesQuery.execute()

        await Promise.all( taskTodoStates.map( async (todoState) => {

            const timers = todoState.timers;

            const totalWorkTime = timers.reduce( (acc, curr) => {
                const start = dayjs.utc( curr.start )
                const stop = curr.stop === null ? dayjs.utc() : dayjs.utc(curr.stop)
                const diff = stop.diff( start, "seconds" )
                return acc + diff
            }, 0 )

            if ( totalWorkTime > 0 ) {
                await logTaskTime(
                    todoState.task_id,
                    userId,
                    Math.floor(totalWorkTime / 60),
                    trx
                )
                await trx.deleteFrom( "taskboard.task_todo_timer" )
                    .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${todoState.task_id})` )
                    .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
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
                    sql<string>`taskboard.task_todo_timer.start::text`.as("start"),
                    sql<string>`taskboard.task_todo_timer.stop::text`.as("stop"),
                    sql<string>`taskboard.task_todo_timer.last_seen::text`.as("last_seen")
                ])
                .executeTakeFirstOrThrow()
        } else {
            return await trx.updateTable( "taskboard.task_todo_timer" )
                .where( "taskboard.task_todo_timer.stop", "is", null )
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

export const stopTaskTimer = async () => {
    
}

export const updateTaskTodoTimerLastSeen = async (
    taskId : string,
    userId : string,
    workspaceId : string,
    trx? : Transaction<DB>
) : Promise<TTaskTodoTimer> => {

    console.log(taskId);
    console.log(userId);
    console.log(workspaceId);

    const query = async ( trx : Transaction<DB> ) => {
        return await trx.updateTable( "taskboard.task_todo_timer" )
            .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "taskboard.task_todo_timer.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .where( "taskboard.task_todo_timer.stop", "is", null )
            .set({
                last_seen : sql.raw("CURRENT_TIMESTAMP")
            })
            .returning([
                sql<string>`taskboard.task_todo_timer.last_seen::text`.as("last_seen"),
                "taskboard.task_todo_timer.start",
                "taskboard.task_todo_timer.stop",
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