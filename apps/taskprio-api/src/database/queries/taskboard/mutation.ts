import { Transaction } from "kysely"
import { EDatabaseFunction } from "../../postgresql.js"
import { DB, TTaskboard } from "@repo/taskprio-types"
import { taskprioKysely } from "../../kysely/kysely.js"
import { sql } from "kysely"

export const createTaskboard = async (
    projectId : string,
    taskboardName : string,
    trx? : Transaction<DB>
) : Promise<TTaskboard | undefined> => {

    const queryBuilder = trx ? trx.insertInto( "taskboard.task_board" ) : taskprioKysely.insertInto( "taskboard.task_board" )

    const taskboard = await queryBuilder
        .values({
            task_board_name : taskboardName,
            project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`
        })
        .returning([
            "task_board_name",
            "created_at",
            "inactive",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .executeTakeFirstOrThrow()

    return taskboard;
}

export const deactivateTaskboard = async (
    projectId : string,
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {   

        // Pause all running task todos
        await trx.updateTable( "taskboard.task_todo_timer" )
            .from( "taskboard.task" )
            .whereRef( "taskboard.task.task_id", "=", "taskboard.task_todo_timer.task_id" )
            .from( "taskboard.task_board" )
            .whereRef( "taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id" )
            .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
            .where( "taskboard.task_todo_timer.stop", "is", null )
            .set({
                stop : sql.raw("CURRENT_TIMESTAMP"),
                last_seen : sql.raw("CURRENT_TIMESTAMP")
            })
            .execute()

        // Deactivate all active task todos related to the taskboard
        await trx.updateTable( "taskboard.task_todo_state" )
            .from( "taskboard.task" )
            .whereRef( "taskboard.task.task_id", "=", "taskboard.task_todo_state.task_id" )
            .from( "taskboard.task_board" )
            .whereRef( "taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id" )
            .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
            .where( "taskboard.task_todo_state.active", "=", true )
            .set({
                active : false
            })
            .execute()

        // Deactivate the taskboard
        await trx.updateTable( "taskboard.task_board" )
            .set({ inactive : true })
            .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async ( trx ) => {
            await query( trx )
        } )
    }

}

export const reactivateTaskboard = async (
    taskboardId : string,
    projectId : string,
    trx? : Transaction<DB>
) : Promise<void> => {
    
    const query = async ( trx : Transaction<DB> ) => {

        await trx.updateTable( "taskboard.task_board" )
            .set({
                inactive : false
            })
            .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
            .where( "taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
            .where( "taskboard.task_board.inactive", "=", true )
            .executeTakeFirstOrThrow()     
    }

    if ( trx ) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute( async (trx) => {
            await query(trx)
        } )
    }

}

export const dropTaskboard = async (
    projectId : string,
    taskboardId : string,
    taskboardName : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        // Delete the main taskboard table
        // Cascade delete will delete all related tables
        await trx.deleteFrom("taskboard.task_board")
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})`)
            .where("taskboard.task_board.task_board_name", "=", taskboardName)
            .executeTakeFirstOrThrow()

    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async ( trx ) => {
            await query( trx )
        } )
    }

}