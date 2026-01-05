import { sql, Transaction } from "kysely";
import { databaseFunctionWrapper, EDatabaseFunction } from "../../postgresql.js";
import { DB, TTaskboard, TTaskboardInactiveForTable } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";

export const getProjectTaskboardList = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TTaskboard[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_board" ) : taskprioKysely.selectFrom( "taskboard.task_board" )

    const taskboardList = await queryBuilder
        .select([
            "taskboard.task_board.task_board_name",
            "taskboard.task_board.created_at",
            "taskboard.task_board.inactive",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as( "task_board_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.project_id)`.as( "project_id" )
        ])
        .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "taskboard.task_board.inactive", "=", false )
        .execute()

    return taskboardList;

}

export const getProjectInactiveTaskboardList = async (
    projectId : string,
    trx? : Transaction<DB>
) : Promise<TTaskboardInactiveForTable[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_board" ) : taskprioKysely.selectFrom( "taskboard.task_board" )

    return await queryBuilder
        .leftJoin( "taskboard.task_section", "taskboard.task_section.task_board_id", "taskboard.task_board.task_board_id" )
        .leftJoin( "taskboard.task", "taskboard.task.task_board_id", "taskboard.task_board.task_board_id" )
        .select( eb => [
            "taskboard.task_board.task_board_name",
            "taskboard.task_board.created_at",
            "taskboard.task_board.inactive",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.task_board_id)`.as( "task_board_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_board.project_id)`.as( "project_id" ),
            eb.fn.count<number>("taskboard.task_section.task_section_id").as( "sections" ),
            eb.fn.count<number>( "taskboard.task.task_id" ).as("tasks")
        ])
        .where( "taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "taskboard.task_board.inactive", "=", true )
        .groupBy([
            "taskboard.task_board.task_board_name",
            "taskboard.task_board.created_at",
            "taskboard.task_board.inactive",
            "taskboard.task_board.task_board_id",
            "taskboard.task_board.project_id"
        ])
        .execute()

}

export const getTaskboardIdFromTaskId = async (
    taskId : string,
    trx? : Transaction<DB>
) : Promise<string | undefined> => {

    const taskboardId = await (trx ? trx : taskprioKysely)
        .selectFrom( "taskboard.task" )
        .select( sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_board_id)`.as( "task_board_id" ) )
        .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .executeTakeFirst()

    return taskboardId?.task_board_id

}