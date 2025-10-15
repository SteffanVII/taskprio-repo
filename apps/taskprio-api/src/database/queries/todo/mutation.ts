import { DB } from "@repo/taskprio-types";
import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { logTaskTime, updateTaskTodoState } from "../task/mutation.js";


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
            .innerJoin( "project.workspace_projects", "project.workspace_projects.project_id", "taskboard.task_board.project_id")
            .select( [
                "taskboard.task_todo_state.task_id",
                "taskboard.task_todo_state.current_work_time"
            ] )
            .where( "taskboard.task_todo_state.active", "=", true )
            .where( "taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .where( "project.workspace_projects.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
            .groupBy([
                "taskboard.task_todo_state.task_id",
                "taskboard.task_todo_state.current_work_time"
            ])

        const taskTodoStates = await taskTodoStatesQuery.execute()

        await Promise.all( taskTodoStates.map( async (todoState) => {
            if ( Number( todoState.current_work_time ) > 0 ) {
                await logTaskTime(
                    todoState.task_id,
                    userId,
                    Math.floor( Number( todoState.current_work_time ) / 60 ),
                    trx
                )
                await updateTaskTodoState(
                    todoState.task_id,
                    userId,
                    {
                        current_work_time : 0
                    },
                    trx
                )
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