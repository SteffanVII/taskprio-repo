import { sql, Transaction } from "kysely";
import { EDatabaseFunction } from "../../postgresql.js";
import { DB, TTaskSection, TUpdateTaskboardSectionRequestBody } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";

export const createTaskSection = async (
    taskboardId : string,
    taskSectionName : string,
    displayOrder : number,
    taskSectionColor? : string,
    trx? : Transaction<DB>
) : Promise<TTaskSection> => {

    const queryBuilder = trx ? trx.insertInto( "taskboard.task_section" ) : taskprioKysely.insertInto( "taskboard.task_section" )

    const taskSection = await queryBuilder
        .values({
            task_section_name : taskSectionName,
            task_board_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})`,
            display_order : displayOrder,
            task_section_color : taskSectionColor
        })
        .returning([
            "task_section_name",
            "task_section_color",
            "display_order",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" )
        ])
        .executeTakeFirstOrThrow()

    return taskSection;

}

// export const updateTaskSection = databaseFunctionWrapper(
//     async (
//         client,
//         taskSectionId : string,
//         body : TUpdateTaskboardSectionRequestBody
//     ) : Promise<TTaskSection> => {

//         const {
//             values,
//             push,
//             getLastIndex,
//             joinClausesAndValueIndex
//         } = clausesOrganizer()

//         if ( body.task_section_name ) {
//             push( "task_section_name", body.task_section_name )
//         }

//         if ( body.display_order ) {
//             push( "display_order", body.display_order )
//         }

//         const updatedTaskSection = await client.query({
//             text : `--sql
//                 UPDATE taskboard."task_section"
//                 SET ${joinClausesAndValueIndex()}
//                 WHERE task_section_id = public.detect_and_convert_to_uuid($${getLastIndex()})
//                 RETURNING
//                     task_section_name,
//                     display_order,
//                     created_at,
//                     public.uuid_to_base64(task_section_id) AS task_section_id,
//                     public.uuid_to_base64(task_board_id) AS task_board_id;
//             `,
//             values : [ ...values, taskSectionId ]
//         })

//         return updatedTaskSection.rows[0] as TTaskSection;

//     },
//     EDatabaseFunctionWrapperMode.TRANSACTION
// )

export const updateTaskSection = async (
    taskSectionId : string,
    body : TUpdateTaskboardSectionRequestBody,
    trx? : Transaction<DB>
) : Promise<TTaskSection> => {

    const queryBuilder = trx ? trx.updateTable( "taskboard.task_section" ) : taskprioKysely.updateTable( "taskboard.task_section" )

    const updatedTaskSection = await queryBuilder
        .$if( !!body.task_section_name, qb => qb.set( "task_section_name", body.task_section_name ) )
        .$if( !!body.display_order, qb => qb.set( "display_order", body.display_order ) )
        .$if( !!body.task_section_color, qb => qb.set( "task_section_color", body.task_section_color ) )
        .where( "task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})` )
        .returning([
            "task_section_name",
            "task_section_color",
            "display_order",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" )
        ])
        .executeTakeFirstOrThrow()

    return updatedTaskSection;

}