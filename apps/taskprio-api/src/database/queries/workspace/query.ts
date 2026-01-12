import { PoolClient } from "pg";
import { databaseFunctionWrapper, EDatabaseFunction, getPoolClient } from "../../postgresql.js";
import { DB, TWorkspace, TWorkspaceMember } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { TransactionBuilder } from "kysely";
import { Kysely } from "kysely";
import { Transaction } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom, jsonBuildObject, jsonObjectFrom } from "kysely/helpers/postgres";

/**
 * Get the workspace of a user
 * @param workspaceId - The base64 encoded ID of the workspace
 * @param userId - The ID of the user
 * @returns The workspace
 */
export const getUserWorkspace = async (
    workspaceId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspace | undefined> => {

    console.log(workspaceId, userId);

    let workspace: TWorkspace | undefined;

    const query = async (trx: Transaction<DB>): Promise<TWorkspace | undefined> => {

        const q = trx
            .selectFrom("workspace.workspace")
            .innerJoin("workspace.workspace_members", "workspace.workspace.workspace_id", "workspace.workspace_members.workspace_id")
            .select(eb => [
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace.workspace_id)`.as("workspace_id"),
                "workspace.workspace.workspace_name",
                jsonArrayFrom(
                    eb.selectFrom("workspace.workspace_members")
                        .leftJoin("tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id")
                        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
                        .select(eb => [
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
                            "tp_user.user.email",
                            "tp_user.user.firstname",
                            "tp_user.user.lastname",
                            "workspace.workspace_members.workspace_role",
                            sql<Date>`workspace.workspace_members.joined_at::timestamp`.as("joined_at"),
                            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
                            "workspace.workspace_members.is_active",
                            eb.case()
                                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                                .then(jsonBuildObject({
                                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                                }))
                                .else(sql<null>`null`)
                                .end()
                                .as("profile_photo")
                        ])
                        .where("workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
                        .where("tp_user.user.user_id", "is not", null)
                ).as("workspace_members")
            ])
            .where("workspace.workspace.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
            .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
            .groupBy(["workspace.workspace.workspace_id", "workspace.workspace.workspace_name"])

        return await q.executeTakeFirst();

    }

    if (trx) {
        workspace = await query(trx);
    } else {
        workspace = await taskprioKysely.transaction().execute(async trx1 => {
            return await query(trx1);
        })
    }

    return workspace;

}

/**
 * Get the workspaces of a user
 * @param userId - The ID of the user
 * @returns The workspaces
 */
export const getUserWorkspaces = async (
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspace[]> => {

    const queryBuilder = trx ? trx.selectFrom("workspace.workspace") : taskprioKysely.selectFrom("workspace.workspace");

    const workspaces = await queryBuilder
        .leftJoin("workspace.workspace_members", "workspace.workspace.workspace_id", "workspace.workspace_members.workspace_id")
        .leftJoin("tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace.workspace_id)`.as("workspace_id"),
            "workspace.workspace.workspace_name",
            jsonArrayFrom(
                eb.selectFrom("workspace.workspace_members")
                    .leftJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
                    .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "tp_user.user.user_id")
                    .select(eb2 => [
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
                        "tp_user.user.email",
                        "tp_user.user.firstname",
                        "tp_user.user.lastname",
                        "workspace.workspace_members.workspace_role",
                        "workspace.workspace_members.is_active",
                        sql<Date>`workspace.workspace_members.joined_at::timestamp`.as("joined_at"),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
                        eb2.case()
                            .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                            .then(jsonBuildObject({
                                photo_file_name: eb2.ref("tp_user.user_profile_photo.photo_file_name"),
                                image_type: eb2.ref("tp_user.user_profile_photo.image_type"),
                                last_modified: eb2.ref("tp_user.user_profile_photo.last_modified")
                            }))
                            .else(sql<null>`null`)
                            .end()
                            .as("profile_photo")
                    ])
                    .whereRef("workspace.workspace_members.workspace_id", "=", eb.ref("workspace.workspace.workspace_id"))
                    .where("tp_user.user.user_id", "is not", null)
            ).as("workspace_members")
        ])
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .groupBy(["workspace.workspace.workspace_id", "workspace.workspace.workspace_name"])
        .execute();

    return workspaces;

}

/**
 * Get the workspace member of a workspace
 * @param workspaceId - The base64 encoded ID of the workspace
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMember = async (
    workspaceId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("workspace.workspace_members") : taskprioKysely.selectFrom("workspace.workspace_members");

    const workspaceMember = await queryBuilder
        .leftJoin("tp_user.user", "workspace.workspace_members.user_id", "tp_user.user.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${workspaceId})`)
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .where("tp_user.user.user_id", "is not", null)
        .executeTakeFirst();

    return workspaceMember;


}

/**
 * Get the workspace member of a project
 * @param projectId - The base64 encoded ID of the project
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByProjectId = async (
    projectId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("project.project") : taskprioKysely.selectFrom("project.project");

    const workspaceMember = await queryBuilder
        .innerJoin("workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id")
        .innerJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${projectId})`)
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a taskboard
 * @param taskboardId - The base64 encoded ID of the taskboard
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskboardId = async (
    taskboardId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("taskboard.task_board") : taskprioKysely.selectFrom("taskboard.task_board");

    const workspaceMember = await queryBuilder
        .innerJoin("project.project", "project.project.project_id", "taskboard.task_board.project_id")
        .innerJoin("workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id")
        .innerJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("taskboard.task_board.task_board_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskboardId})`)
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a task section
 * @param taskSectionId - The base64 encoded ID of the task section
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskSectionId = async (
    taskSectionId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember | undefined> => {
    const queryBuilder = trx ? trx.selectFrom("taskboard.task_section") : taskprioKysely.selectFrom("taskboard.task_section");

    const workspaceMember = await queryBuilder
        .innerJoin("taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id")
        .innerJoin("project.project", "project.project.project_id", "taskboard.task_board.project_id")
        .innerJoin("workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id")
        .innerJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("taskboard.task_section.task_section_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskSectionId})`)
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .executeTakeFirst()

    return workspaceMember;

}

/**
 * Get the workspace member of a task
 * @param taskId - The base64 encoded ID of the task
 * @param userId - The ID of the user
 * @returns The workspace member
 */
export const getWorkspaceMemberByTaskId = async (
    taskId: string,
    userId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember | undefined> => {
    const queryBuilder = trx ? trx.selectFrom("taskboard.task") : taskprioKysely.selectFrom("taskboard.task");

    const workspaceMember = await queryBuilder
        .innerJoin("taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id")
        .innerJoin("taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id")
        .innerJoin("project.project", "project.project.project_id", "taskboard.task_board.project_id")
        .innerJoin("workspace.workspace_members", "workspace.workspace_members.workspace_id", "project.project.workspace_id")
        .innerJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "workspace.workspace_members.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.workspace_role",
            "workspace.workspace_members.joined_at",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${taskId})`)
        .where("workspace.workspace_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${userId})`)
        .executeTakeFirst()

    return workspaceMember;
}

/**
 * @description Get the workspace id from a project id
 * @param project_id - The project id
 * @returns The workspace id
 */
export const getWorkspaceIdFromProjectId = async (
    projectId: string,
    trx?: Transaction<DB>
): Promise<string | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("project.project") : taskprioKysely.selectFrom("project.project");

    const workspaceId = await queryBuilder
        .select(sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as("workspace_id"))
        .where("project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${projectId})`)
        .executeTakeFirst()

    return workspaceId?.workspace_id;

}

export const getWorkspaceIdFromTaskId = async (
    taskId: string,
    trx?: Transaction<DB>
): Promise<string | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("taskboard.task") : taskprioKysely.selectFrom("taskboard.task");

    return (await queryBuilder
        .innerJoin("taskboard.task_section", "taskboard.task_section.task_section_id", "taskboard.task.task_section_id")
        .innerJoin("taskboard.task_board", "taskboard.task_board.task_board_id", "taskboard.task_section.task_board_id")
        .innerJoin("project.project", "project.project.project_id", "taskboard.task_board.project_id")
        .select(sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project.project.workspace_id)`.as("workspace_id"))
        .where("taskboard.task.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`)
        .executeTakeFirst()).workspace_id;

}

export const getWorkspaceMembers = async (
    workspaceId: string,
    trx?: Transaction<DB>
): Promise<TWorkspaceMember[]> => {

    const queryBuilder = trx ? trx.selectFrom("workspace.workspace_members") : taskprioKysely.selectFrom("workspace.workspace_members");

    return await queryBuilder
        .leftJoin("tp_user.user", "tp_user.user.user_id", "workspace.workspace_members.user_id")
        .leftJoin("tp_user.user_profile_photo", "tp_user.user_profile_photo.user_id", "tp_user.user.user_id")
        .select(eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.invited_by)`.as("invited_by"),
            "workspace.workspace_members.joined_at",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.user_id)`.as("user_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace.workspace_members.workspace_id)`.as("workspace_id"),
            "workspace.workspace_members.workspace_role",
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            "workspace.workspace_members.is_active",
            eb.case()
                .when("tp_user.user_profile_photo.photo_file_name", "is not", null)
                .then(jsonBuildObject({
                    photo_file_name: eb.ref("tp_user.user_profile_photo.photo_file_name"),
                    image_type: eb.ref("tp_user.user_profile_photo.image_type"),
                    last_modified: eb.ref("tp_user.user_profile_photo.last_modified")
                }))
                .else(sql<null>`null`)
                .end()
                .as("profile_photo")
        ])
        .where("tp_user.user.user_id", "is not", null)
        .where("workspace.workspace_members.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.BASE64_TO_UUID)}(${workspaceId})`)
        .execute()

}