import { DB, TTaskTodoTimer, TUserTaskTodoState } from "@repo/taskprio-types";
import { Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";



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
        .selectAll()
        .execute()

}