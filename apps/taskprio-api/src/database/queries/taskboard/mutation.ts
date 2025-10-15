import { Transaction } from "kysely"
import { databaseFunctionWrapper, EDatabaseFunction, EDatabaseFunctionWrapperMode } from "../../postgresql.js"
import { createTaskSection } from "../tasksection/mutation.js"
import { DB, TTaskboard } from "@repo/taskprio-types"
import { Kysely } from "kysely"
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
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .executeTakeFirstOrThrow()

    return taskboard;
}

// export const createTaskboard = databaseFunctionWrapper(
//     async (
//         client,
//         projectId : string,
//         taskboardName : string
//     ) : Promise<TTaskboard | undefined> => {

//         const createdTaskboard = await client.query({
//             text : `--sql
//                 INSERT INTO taskboard."task_board" (
//                     task_board_name,
//                     project_id
//                 ) VALUES (
//                     $1,
//                     public.detect_and_convert_to_uuid($2)
//                 ) RETURNING
//                     task_board_name,
//                     created_at,
//                     public.uuid_to_base64(task_board_id) AS task_board_id,
//                     public.uuid_to_base64(project_id) AS project_id;
//             `,
//             values : [ taskboardName, projectId ]
//         })

//         const toDoTaskSection = await createTaskSection(
//             createdTaskboard.rows[0].task_board_id,
//             "To Do",
//             1,
//             client
//         )

//         const inProgressTaskSection = await createTaskSection(
//             createdTaskboard.rows[0].task_board_id,
//             "In Progress",
//             toDoTaskSection.display_order + 100,
//             client
//         )

//         await createTaskSection(
//             createdTaskboard.rows[0].task_board_id,
//             "Done",
//             inProgressTaskSection.display_order + 100,
//             client
//         )

//         return createdTaskboard.rows[0]

//     },
//     EDatabaseFunctionWrapperMode.TRANSACTION
// )