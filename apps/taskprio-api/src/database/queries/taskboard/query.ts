import { sql, Transaction } from "kysely";
import { databaseFunctionWrapper, EDatabaseFunction } from "../../postgresql.js";
import { DB, TTaskboard } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";

// export const getProjectTaskboardList = databaseFunctionWrapper(
//     async (
//         client,
//         projectId : string
//     ) : Promise<TTaskboard[] | undefined> => {
//         const taskboardList = await client.query({
//             text : `--sql
//                 SELECT
//                     task_board_name,
//                     created_at,
//                     public.uuid_to_base64(task_board_id) AS task_board_id,
//                     public.uuid_to_base64(project_id) AS project_id
//                 FROM
//                     taskboard."task_board"
//                 WHERE
//                     project_id = public.detect_and_convert_to_uuid($1)
//             `,
//             values : [ projectId ]
//         })
//         return taskboardList.rows
//     }
// )

export const getProjectTaskboardList = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TTaskboard[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_board" ) : taskprioKysely.selectFrom( "taskboard.task_board" )

    const taskboardList = await queryBuilder
        .select([
            "taskboard.task_board.task_board_name",
            "taskboard.task_board.created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as( "task_board_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.project_id)`.as( "project_id" )
        ])
        .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .execute()

    return taskboardList;

}