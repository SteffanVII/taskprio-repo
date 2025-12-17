import { PoolClient } from "pg"
import { clausesOrganizer, databaseFunctionWrapper, EDatabaseFunction, EDatabaseFunctionWrapperMode, getPoolClient } from "../../postgresql.js"
import { getTask, getTaskComment, getTaskLastDisplayOrder, getTaskPrimitive, getTasksTodoLastDisplayOrder } from "./query.js"
import { DB, TArrangeTaskRequestBody, TaskboardTask, TTask, TTaskAssignee, TTaskComment, TTaskPrimitive, TTaskTimeLog, TUpdateTaskPrimitiveFieldsRequestBody, TUpdateTaskTodoStateRequestBody } from "@repo/taskprio-types"
import { taskprioKysely } from "../../kysely/kysely.js"
import { Transaction, Updateable } from "kysely"
import { sql } from "kysely"
import { getWorkspaceIdFromTaskId } from "../workspace/query.js"
import { getFirstTaskSectionFromTaskboard, getTaskboardSections, getTaskSectionPrimitive } from "../tasksection/query.js"

export const createTask = async (
    taskSectionId : string,
    taskName : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TTask> => {

    const query = async ( trx : Transaction<DB> ) : Promise<TTask> => {
       
        const lastDisplayOrder = await getTaskLastDisplayOrder( taskSectionId, trx )

        const task = (await trx
            .with( "task_section_project", db1 => {
                return db1.selectFrom( "taskboard.task_section" )
                    .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
                    .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
                    .select([
                        "project.project.project_id",
                        "taskboard.task_section.task_board_id"
                    ])
                    .where( "taskboard.task_section.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})` )
            } )
            .with( "current_task_depth", db2 => {
                return db2.selectFrom( "taskboard.task" )
                    .innerJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
                    .innerJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
                    .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
                    .innerJoin( "task_section_project", "task_section_project.project_id", "project.project.project_id" )
                    .select( eb => eb.fn.countAll().as( "task_depth" ))
                    .where( "project.project.project_id", "=", eb => eb.selectFrom( "task_section_project" ).select( "project_id" ) )
            } )
            .with( "new_task", db3 => {
                return db3.insertInto( "taskboard.task" )
                    .values({
                        task_section_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})`,
                        task_board_id : eb => eb.selectFrom( "task_section_project" ).select( "task_board_id" ),
                        task_title : taskName,
                        task_depth : sql<number>`(SELECT task_depth FROM current_task_depth) + 1`,
                        display_order : lastDisplayOrder + 100,
                        created_by : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
                    })
                    .returning([
                        "task_id"
                    ])
            } )
            .selectFrom( "new_task" )
            .selectAll()
            .executeTakeFirstOrThrow()
        )

        return await getTask( task.task_id, userId, trx )

    }

    if ( trx ) {
        return await query( trx )
    } else {

        return await taskprioKysely.transaction().execute( async trx => {
            return await query( trx )
        } )

    }

}

export const arrangeTask = async (
    taskId : string,
    body : TArrangeTaskRequestBody,
    trx? : Transaction<DB>
) : Promise<TTaskPrimitive> => {

    const query = async ( trx : Transaction<DB> ) : Promise<TTaskPrimitive> => {
        await trx.updateTable( "taskboard.task" )
        .$if( !!body.display_order, qb => qb.set( "display_order", body.display_order ) )
        .$if( !!body.task_section_id, qb => qb.set( "task_section_id", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${body.task_section_id})` ) )
        .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .returning([
            "task_title",
            "task_description",
            "task_estimate",
            "task_deadline",
            "display_order",
            "created_at",
            "last_modified",
            "in_trash",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_id)`.as( "task_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(created_by)`.as( "created_by" )
        ])
        .executeTakeFirstOrThrow()

        return await getTaskPrimitive( taskId, trx )
    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const transferTaskToTrash = async (
    taskId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {
        trx.updateTable( "taskboard.task" )
            .set({
                in_trash : true
            })
            .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .executeTakeFirstOrThrow()
    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const restoreTaskFromTrash = async (
    taskId : string,
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        const task = await getTaskPrimitive( taskId, trx )

        if ( !task ) {
            throw new Error( "Task not found" )
        }

        let taskSection = await getTaskSectionPrimitive( task.task_section_id, trx )

        if ( !taskSection ) {
            taskSection = await getFirstTaskSectionFromTaskboard( taskboardId, trx )
        }

        if ( !taskSection ) {
            throw new Error( "There is no task section available to restore the task to" )
        }

        const lastDisplayOrder = await getTaskLastDisplayOrder( task.task_section_id )

        trx.updateTable( "taskboard.task" )
            .set({
                task_section_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSection.task_section_id})`,
                display_order : lastDisplayOrder + 100,
                in_trash : false
            })
            .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .executeTakeFirstOrThrow()

    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const updateTaskPrimitiveFields = async (
    taskId : string,
    body : TUpdateTaskPrimitiveFieldsRequestBody,
    trx? : Transaction<DB>
) : Promise<TTaskPrimitive> => {

    const query = async ( trx : Transaction<DB> ) : Promise<TTaskPrimitive> => {
        await trx.updateTable( "taskboard.task" )
            .$if( !!body.task_title, qb => qb.set( "task_title", body.task_title ) )
            .$if( body.task_description !== null && body.task_description !== undefined, qb => qb.set( "task_description", body.task_description ) )
            .$if( !!body.task_estimate, qb => qb.set( "task_estimate", body.task_estimate ) )
            .$if( !!body.task_deadline, qb => qb.set( "task_deadline", body.task_deadline ) )
            .where( "taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId}::text)` )
            .returning([
                "task_title",
                "task_description",
                "task_deadline",
                "task_estimate",
                "display_order",
                "created_at",
                "last_modified",
                "in_trash",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_id)`.as( "task_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(created_by)`.as( "created_by" )
            ])
            .executeTakeFirstOrThrow()

        return await getTaskPrimitive( taskId, trx )
    }

    if ( trx ) {
        return await query( trx )
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

export const addTaskAssignee = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<TTaskAssignee> => {

    const queryBuilder = trx ? trx : taskprioKysely;

    const query = await queryBuilder
        .with( "existing_assignee", (qc) => {
            return qc.selectFrom( "taskboard.task_assignee" )
                .innerJoin( "tp_user.user", "tp_user.user.user_id", "taskboard.task_assignee.user_id" )
                .select([
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tp_user.user.user_id)`.as( "user_id" ),
                    "tp_user.user.firstname",
                    "tp_user.user.lastname"
                ])
                .where( "taskboard.task_assignee.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                .where( "taskboard.task_assignee.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .where( "tp_user.user.user_id", "is not", null )
        } )
        .with( "inserted_assignee", (qc) => {
            return sql`(
                INSERT INTO taskboard."task_assignee" (
                    task_id,
                    user_id
                ) SELECT
                    ${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId}),
                    ${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})
                WHERE NOT EXISTS ( SELECT 1 FROM existing_assignee )
                RETURNING
                    user_id
            )`
        } )
        .with( "final_assignee", (qc) => {
            return qc.selectFrom( "inserted_assignee" )
                .leftJoin( "tp_user.user", "tp_user.user.user_id", "inserted_assignee.user_id" )
                .select([
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(inserted_assignee.user_id)`.as( "user_id" ),
                    "tp_user.user.firstname",
                    "tp_user.user.lastname"
                ])
        } )
        .selectFrom( "existing_assignee" ).selectAll()
        .unionAll( qb => qb.selectFrom( "final_assignee" ).selectAll() )

    const assignee = await query.executeTakeFirstOrThrow();

    return assignee;

}

export const removeTaskAssignee = async (
    taskId : string,
    userId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const queryBuilder = trx ? trx : taskprioKysely;

    await queryBuilder.deleteFrom( "taskboard.task_assignee" )
        .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .execute();

}

export const logTaskTime = async (
    taskId : string,
    userId : string,
    timeSpent : number,
    trx? : Transaction<DB>
) : Promise<TTaskTimeLog> => {

    const queryBuilder = trx ? trx : taskprioKysely;


    const createdTaskTimeLog = await queryBuilder.insertInto( "taskboard.task_time_log" )
        .values({
            task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`,
            user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
            time_spent : timeSpent
        })
        .returning([
            "time_spent",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_time_log_id)`.as( "task_time_log_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_id)`.as( "task_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(user_id)`.as( "user_id" )
        ])
        .executeTakeFirstOrThrow();

    return createdTaskTimeLog;

}

export const addTaskToTodo = async (
    taskId : string,
    userId : string,
    displayOrder? : number,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        // Check if the task is already has a todo state
        const existingTaskTodoState = await trx.selectFrom( "taskboard.task_todo_state" )
            .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
            .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
            .executeTakeFirst();

        const workspaceId = await getWorkspaceIdFromTaskId( taskId, trx )

        if ( existingTaskTodoState ) {

            let displayOrderToUse = displayOrder

            if ( !displayOrder ) {
                const lastDisplayOrder = await getTasksTodoLastDisplayOrder( workspaceId, userId, trx )
                displayOrderToUse = lastDisplayOrder + 100
            }

            await trx.updateTable( "taskboard.task_todo_state")
                .set({
                    active : true,
                    display_order : displayOrderToUse,
                    work_time_goal : 900
                })
                .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .executeTakeFirstOrThrow();
        } else {

            let displayOrderToUse = displayOrder;

            if ( !displayOrderToUse ) {
                displayOrderToUse = await getTasksTodoLastDisplayOrder( workspaceId, userId, trx ) + 100
            }

            await trx.insertInto( "taskboard.task_todo_state" )
                .values({
                    task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`,
                    user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                    active : true,
                    display_order : displayOrderToUse
                })
                .executeTakeFirstOrThrow();
        }

    }

    if ( trx ) {
        await query( trx)
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx))
    }

}

/**
 * @description Update the task todo state
 * @param taskId - The UUID or Base64 ID of the task
 * @param userId - The UUID or Base64 ID of the user
 * @param body - The body of the request
 * @param body.display_order - The display order to update
 * @param body.active - The active status to update
 * @param body.current_work_time - The current work time to update
 * @param body.work_time_goal - The work time goal to update
 * @param trx - The transaction to use if any. If not provided, a new transaction will be created.
 */
export const updateTaskTodoState = async (
    taskId : string,
    userId : string,
    body : TUpdateTaskTodoStateRequestBody,
    trx? : Transaction<DB>
) : Promise<void> => {

    const query = async ( trx : Transaction<DB> ) => {

        await trx.updateTable( "taskboard.task_todo_state" )
        .$if( body.display_order !== undefined && body.display_order !== null, qb => qb.set( "display_order", body.display_order ) )
        .$if( body.active !== undefined && body.active !== null, qb => qb.set( "active", body.active ) )
        .$if( body.current_work_time !== undefined && body.current_work_time !== null, qb => qb.set( "current_work_time", body.current_work_time ) )
        .$if( body.work_time_goal !== undefined && body.work_time_goal !== null, qb => qb.set( "work_time_goal", body.work_time_goal ) )
        .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
        .executeTakeFirstOrThrow()

        // remove task todo timers if active is set to false
        if ( body.active !== undefined && body.active === false ) {
            await trx.deleteFrom( "taskboard.task_todo_timer" )
                .where( "taskboard.task_todo_timer.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
                .where( "taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
                .executeTakeFirstOrThrow()
        }

    }

    if ( trx ) {
        await query( trx )
    } else {
        await taskprioKysely.transaction().execute( async trx => await query( trx ) )
    }

}

/**
 * @description Add a task comment
 * @param taskId - The UUID or Base64 ID of the task
 * @param userId - The UUID or Base64 ID of the user
 * @param commentContent - The content of the comment
 * @param trx - The transaction to use if any. If not provided, a new transaction will be created.
 */
export const addTaskComment = async (
    taskId : string,
    userId : string,
    commentContent : string,
    replyingToTaskCommentId? : string,
    trx? : Transaction<DB>
) : Promise<TTaskComment> => {

    const query = async ( trx : Transaction<DB> ) => {

        const createdTaskComment = await trx.insertInto( "taskboard.task_comment" )
            .values({
                task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`,
                user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                ...( !!replyingToTaskCommentId && { replying_to_task_comment_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${replyingToTaskCommentId})` } ),
                comment_content : commentContent
            })
            .returning([
                "task_comment_id"
            ])
            .executeTakeFirstOrThrow()

        return await getTaskComment( createdTaskComment.task_comment_id, trx )

    }

    if ( trx ) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute( async trx => await query( trx ))
    }

}
