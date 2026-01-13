import { EDatabaseFunction } from "../../postgresql.js";
import { getProject, getProjectMembersByTheirUserId } from "./query.js";
import { DB, EProjectRole, TCreateProjectRequestBody, TProject, TProjectMember, TProjectPrimitive, TUpdateProjectCustomizationRequestBody } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql } from "kysely";
import { Transaction } from "kysely";
import { getProjectNameAbbreviation } from "../../../utilities/projectAbbreviation.js";

export const createProject = async (
    body: TCreateProjectRequestBody,
    userId: string
): Promise<TProject | undefined> => {

    const projectNameAbbreviation = getProjectNameAbbreviation(body.project_name)

    return await taskprioKysely.transaction().execute(async trx => {

        const createdProject = await trx.insertInto("project.project")
            .values({
                project_name: body.project_name,
                project_abbreviation: projectNameAbbreviation,
                workspace_id: sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${body.workspace_id})`,
                created_by: sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        // await trx.insertInto( "project.workspace_projects" )
        //     .values({
        //         workspace_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${body.workspace_id})`,
        //         project_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
        //         user_id : sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
        //     })
        //     .returningAll()
        //     .executeTakeFirstOrThrow()

        await trx.insertInto("project.project_members")
            .values({
                user_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                project_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
                project_role: EProjectRole.OWNER,
                invited_by: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        await trx.insertInto("taskboard.task_board")
            .values({
                project_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdProject.project_id})`,
                task_board_name: body.project_name + " Board"
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        return await getProject(createdProject.project_id, trx)

    })

}

export const addProjectMember = async (
    projectId: string,
    userId: string,
    invitedBy: string,
    projectRole: EProjectRole,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = trx ? trx.insertInto("project.project_members") : taskprioKysely.insertInto("project.project_members")

    await query
        .values({
            user_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
            project_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
            project_role: projectRole,
            invited_by: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
        })
        .returningAll()
        .executeTakeFirstOrThrow()

}

export const addMemberToProjects = async (
    userId: string,
    invitedBy: string,
    projectRole: EProjectRole,
    projects: string[],
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {
        await Promise.all(projects.map(async projectId => {

            await trx.insertInto("project.project_members")
                .values({
                    user_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                    project_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
                    project_role: projectRole,
                    invited_by: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
                })
                .returningAll()
                .executeTakeFirstOrThrow()

        }))
    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => {
            await query(trx)
        })
    }


}

export const addMembersToProject = async (
    projectId: string,
    invitedBy: string,
    members: {
        user_id: string,
        role: EProjectRole
    }[],
    trx?: Transaction<DB>
): Promise<TProjectMember[]> => {

    const query = async (trx: Transaction<DB>) => {

        trx.insertInto("project.project_members")
            .values(members.map(member => ({
                user_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${member.user_id})`,
                project_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`,
                project_role: member.role,
                invited_by: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${invitedBy})`
            })))
            .returningAll()
            .executeTakeFirstOrThrow()

        return await getProjectMembersByTheirUserId(
            members.map(member => member.user_id),
            projectId,
            trx
        )
    }

    if (trx) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const updateProjectCustomization = async (
    projectId: string,
    body: TUpdateProjectCustomizationRequestBody,
    trx?: Transaction<DB>
): Promise<TProjectPrimitive> => {

    const query = async (trx: Transaction<DB>): Promise<TProjectPrimitive> => {

        return await trx.updateTable("project.project")
            .$if(!!body.project_name, qb => qb.set("project_name", body.project_name))
            .$if(!!body.project_abbreviation, qb => qb.set("project_abbreviation", body.project_abbreviation))
            .$if(!!body.project_color, qb => qb.set("project_color", body.project_color))
            .where("project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .returning([
                "project_name",
                "project_abbreviation",
                "project_color",
                "created_at",
                "active",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as("workspace_id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(created_by)`.as("created_by"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as("project_id")
            ])
            .executeTakeFirstOrThrow()

    }

    if (trx) {
        return await query(trx)
    } else {
        return await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const getProjectPrimitive = async (
    projectId: string,
    trx?: Transaction<DB>
): Promise<TProjectPrimitive | undefined> => {

    const queryBuilder = trx ? trx.selectFrom("project.project") : taskprioKysely.selectFrom("project.project")

    return await queryBuilder
        .select([
            "project_name",
            "project_abbreviation",
            "project_color",
            "created_at",
            "active",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as("project_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(workspace_id)`.as("workspace_id"),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(created_by)`.as("created_by")
        ])
        .where("project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
        .executeTakeFirst()

}

export const updateProjectMemberRole = async (
    projectId: string,
    memberId: string,
    role: EProjectRole,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {

        await trx.updateTable("project.project_members")
            .set({
                project_role: role
            })
            .where("project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${memberId})`)
            .executeTakeFirstOrThrow()

    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const deactivateProject = async (
    workspaceId: string,
    projectId: string,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {

        // TODO

        // Pause all running task todos
        await trx.updateTable("taskboard.task_todo_timer")
            .from("taskboard.task")
            .whereRef("taskboard.task.task_id", "=", "taskboard.task_todo_timer.task_id")
            .from("taskboard.task_board")
            .whereRef("taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id")
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("taskboard.task_todo_timer.stop", "is", null)
            .set({
                stop: sql.raw("CURRENT_TIMESTAMP"),
                last_seen: sql.raw("CURRENT_TIMESTAMP")
            })
            .execute()

        // Deactivate all active task todos related to the project
        await trx.updateTable("taskboard.task_todo_state")
            .from("taskboard.task")
            .whereRef("taskboard.task.task_id", "=", "taskboard.task_todo_state.task_id")
            .from("taskboard.task_board")
            .whereRef("taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id")
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("taskboard.task_todo_state.active", "=", true)
            .set({
                active: false
            })
            .execute()

        // Deactivate the project
        await trx.updateTable("project.project")
            // .from( "project.workspace_projects" )
            // .whereRef( "project.workspace_projects.project_id", "=", "project.project.project_id" )
            .set({
                active: false
            })
            .where("project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
            .where("project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .executeTakeFirstOrThrow()
    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const deactivateProjectMember = async (
    userId: string,
    projectId: string,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {

        await trx.updateTable("project.project_members")
            .set({
                is_active: false
            })
            .where("project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
            .where("project.project_members.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .executeTakeFirstOrThrow()

        await trx.updateTable("taskboard.task_todo_state")
            .from("taskboard.task")
            .whereRef("taskboard.task.task_id", "=", "taskboard.task_todo_state.task_id")
            .from("taskboard.task_board")
            .whereRef("taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id")
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .set({
                active: false
            })
            .where("taskboard.task_todo_state.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .execute()

        await trx.updateTable( "taskboard.task_todo_timer" )
            .where("taskboard.task_todo_timer.stop", "is", null)
            .where("taskboard.task_todo_timer.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
            .from( "taskboard.task" )
            .whereRef( "taskboard.task.task_id", "=", "taskboard.task_todo_timer.task_id" )
            .from( "taskboard.task_board" )
            .whereRef( "taskboard.task_board.task_board_id", "=", "taskboard.task.task_board_id" )
            .where("taskboard.task_board.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .set({
                stop : sql.raw("CURRENT_TIMESTAMP"),
                last_seen : sql.raw("CURRENT_TIMESTAMP")
            })
            .execute()

    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const reactivateProjectMember = async (
    userId: string,
    projectId: string,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {
        await trx.updateTable("project.project_members")
            .set({
                is_active: true
            })
            .where("project.project_members.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`)
            .where("project.project_members.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .executeTakeFirstOrThrow()
    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }


}

export const reactivateProject = async (
    workspaceId: string,
    projectId: string,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {

        await trx.updateTable("project.project")
            // .from( "project.workspace_projects" )
            // .whereRef( "project.workspace_projects.project_id", "=", "project.project.project_id" )
            .set({
                active: true
            })
            .where("project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
            .where("project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("project.project.active", "=", false)
            .executeTakeFirstOrThrow()

    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}

export const dropProject = async (
    workspaceId: string,
    projectId: string,
    projectName: string,
    trx?: Transaction<DB>
): Promise<void> => {

    const query = async (trx: Transaction<DB>) => {
        // Delete project
        await trx.deleteFrom("project.project")
            // .using( "project.workspace_projects" )
            // .whereRef( "project.workspace_projects.project_id", "=", "project.project.project_id" )
            .where("project.project.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`)
            .where("project.project.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
            .where("project.project.project_name", "=", projectName)
            .executeTakeFirstOrThrow()
        // // Delete workspace project join
        // await trx.deleteFrom( "project.workspace_projects" )
        //     .where( "project.workspace_projects.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})` )
        //     .where( "project.workspace_projects.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        //     .executeTakeFirstOrThrow()
    }

    if (trx) {
        await query(trx)
    } else {
        await taskprioKysely.transaction().execute(async trx => await query(trx))
    }

}