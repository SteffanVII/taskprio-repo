import { sql, Transaction } from "kysely"
import { taskprioKysely } from "../../kysely/kysely.js"
import { databaseFunctionWrapper, EDatabaseFunction } from "../../postgresql.js"
import { DB, TTaskSection, TTaskSectionWithTasks } from "@repo/taskprio-types"
import { jsonArrayFrom } from "kysely/helpers/postgres"

/**
 * @description Get the taskboard sections.
 * @param client 
 * @param taskboardId 
 * @returns TTaskSection[]
 */
export const getTaskboardSections = async (
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<TTaskSection[]> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" )

    const taskboardSections = await queryBuilder
        .select([
            "task_section_name",
            "task_section_color",
            "display_order",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" )
        ])
        .where( "task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
        .orderBy( "display_order", "asc" )
        .execute()

    return taskboardSections;

}

export const getTaskSectionPrimitive = async (
    taskSectionId : string,
    trx? : Transaction<DB>
) : Promise<TTaskSection | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" )

    return await queryBuilder
        .select([
            "task_section_name",
            "task_section_color",
            "display_order",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" )
        ])
        .where( "task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskSectionId})` )
        .executeTakeFirst()

}

export const getFirstTaskSectionFromTaskboard = async (
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<TTaskSection | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" )

    return await queryBuilder
        .select([
            "task_section_name",
            "task_section_color",
            "display_order",
            "created_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_section_id)`.as( "task_section_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(task_board_id)`.as( "task_board_id" )
        ])
        .where( "task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
        .orderBy( "display_order", "desc" )
        .executeTakeFirst()

}

/**
 * @description Get the taskboard sections with tasks for card view.
 * @param client 
 * @param taskboardId 
 * @returns TTaskSectionWithTasks[]
 */
export const getTaskboardSectionsWithTasksForCardView = async (
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<TTaskSectionWithTasks[]> => {

    const queryBuilder = trx ? trx : taskprioKysely

    const taskboardSections = await queryBuilder
        .with( "task_with_assignees", (qb) => {
            return qb.selectFrom( "taskboard.task" )
                .leftJoin( "taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id" )
                .leftJoin( "taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id" )
                .leftJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
                .select( eb => [
                    "taskboard.task.task_title",
                    "taskboard.task.task_description",
                    "taskboard.task.task_estimate",
                    "taskboard.task.task_deadline",
                    "taskboard.task.display_order",
                    "taskboard.task.created_at",
                    "taskboard.task.last_modified",
                    "taskboard.task.in_trash",
                    "taskboard.task.task_depth",
                    "project.project.project_abbreviation",
                    "project.project.project_color",
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_id)`.as( "task_id" ),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.task_section_id)`.as( "task_section_id" ),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task.created_by)`.as( "created_by" ),
                    eb.selectFrom( "taskboard.task_section" )
                        .innerJoin( "taskboard.task_board", "taskboard.task_section.task_board_id", "taskboard.task_board.task_board_id" )
                        .innerJoin( "project.project", "project.project.project_id", "taskboard.task_board.project_id" )
                        .select( "project.project.project_abbreviation" )
                        .where( "taskboard.task_section.task_section_id", "=", sql<string>`taskboard.task.task_section_id::uuid` )
                        .as( "project_abbreviation" ),
                    jsonArrayFrom(
                        qb.selectFrom( "taskboard.task_assignee" )
                            .innerJoin( "tp_user.user", "tp_user.user.user_id", "taskboard.task_assignee.user_id" )
                            .innerJoin( "project.project_members", "project.project_members.user_id", "tp_user.user.user_id" )
                            .select([
                                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_assignee.user_id)`.as( "user_id" ),
                                "tp_user.user.firstname",
                                "tp_user.user.lastname"
                            ])
                            .where( "taskboard.task_assignee.task_id", "=", eb.ref( "taskboard.task.task_id" ) )
                            .where( "tp_user.user.user_id", "is not", null )
                            .where( "project.project_members.is_active", "=", true )
                            .where( "project.project_members.project_id", "=", eb.ref( "project.project.project_id" ) )
                    ).as( "assignees" ),
                    jsonArrayFrom(
                        eb.selectFrom( "taskboard.task_tag" )
                            .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
                            .select([
                                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" ),
                                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project_tags.tag_id)`.as( "tag_id" ),
                                "project.project_tags.tag_name",
                                "project.project_tags.tag_color"
                            ])
                            .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(taskboard.task.task_id::text)` )
                    ).as( "tags" )
                ])
                .where( "taskboard.task.in_trash", "is", false )
                .groupBy([
                    "taskboard.task.task_id",
                    "taskboard.task.task_section_id",
                    "taskboard.task.task_title",
                    "taskboard.task.task_description",
                    "taskboard.task.task_estimate",
                    "taskboard.task.task_deadline",
                    "taskboard.task.display_order",
                    "taskboard.task.created_at",
                    "taskboard.task.created_by",
                    "taskboard.task.last_modified",
                    "taskboard.task.in_trash",
                    "taskboard.task.task_depth",
                    "project.project.project_abbreviation",
                    "project.project.project_color",
                ])
                .orderBy( "taskboard.task.display_order", "asc" )
        } )
        .selectFrom( "taskboard.task_section" )
            .select( eb => [
                "taskboard.task_section.task_section_name",
                "taskboard.task_section.display_order",
                "taskboard.task_section.created_at",
                "taskboard.task_section.task_section_color",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_section.task_section_id)`.as( "task_section_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_section.task_board_id)`.as( "task_board_id" ),
                jsonArrayFrom(
                    eb.selectFrom( "task_with_assignees" )
                        .selectAll()
                        .where( "task_with_assignees.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_section.task_section_id)` )
                ).as( "tasks" )
            ])
            .where( "taskboard.task_section.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
            .orderBy( "taskboard.task_section.display_order", "asc" )
            .execute()

    return taskboardSections;
}

/**
 * @description Get the last taskboard section display order available.
 * @param client 
 * @param taskboardId 
 * @returns number
 */
export const getLastTaskboardSectionDisplayOrder = async (
    taskboardId : string,
    trx? : Transaction<DB>
) : Promise<number | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "taskboard.task_section" ) : taskprioKysely.selectFrom( "taskboard.task_section" )

    const lastTaskboardSection = await queryBuilder
        .select( sql<number>`COALESCE(MAX(display_order), -99)`.as( "display_order" ) )
        .where( "task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskboardId})` )
        .executeTakeFirst()

    return lastTaskboardSection?.display_order;

}