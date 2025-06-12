import { PoolClient } from "pg";
import { getPoolClient, getPostgrePool } from "../../postgresql.js";
import { TProjectMember } from "../../../routes/project/types.js";

export const getProject = async ( project_id : string, postgreClient? : PoolClient ) => {

    try {
        const {
            client,
            release
        } = await getPoolClient(postgreClient);

        const project = await client.query({
            text : `--sql
                SELECT
                    p.project_id,
                    p.project_slug,
                    p.project_name,
                    json_agg(
                        json_build_object(
                            'user_id', u.user_id,
                            'email', u.email,
                            'firstname', u.firstname,
                            'lastname', u.lastname,
                            'project_role', pm.project_role,
                            'joined_at', pm.joined_at,
                            'is_active', pm.is_active
                        )
                    ) as project_members
                FROM
                    public."project" p
                JOIN
                    public."project_members" pm ON p.project_id = pm.project_id
                JOIN
                    public."user" u ON pm.user_id = u.user_id
                WHERE
                    p.project_id = $1
                GROUP BY
                    p.project_id, p.project_name;
            `,
            values : [ project_id ]
        })

        release()

        return project.rows[0]

    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const getUserWorkspaceProjects = async ( workspace_id : string, user_id : string, poolClient? : PoolClient ) => {

    const {
        client,
        release
    } = await getPoolClient(poolClient);

    try {

        const projects = await client.query({
            text : `--sql
                SELECT
                    p.project_id,
                    p.project_slug,
                    p.project_name,
                    json_agg(
                        json_build_object(
                            'user_id', u.user_id,
                            'email', u.email,
                            'firstname', u.firstname,
                            'lastname', u.lastname,
                            'project_role', pm.project_role,
                            'joined_at', pm.joined_at,
                            'is_active', pm.is_active
                        )
                    ) as project_members
                FROM
                    public."workspace_projects" wp
                JOIN
                    public."project" p ON wp.project_id = p.project_id
                JOIN
                    public."project_members" pm ON p.project_id = pm.project_id
                JOIN
                    public."user" u ON pm.user_id = u.user_id
                WHERE
                    wp.workspace_id = $1 AND pm.user_id = $2
                GROUP BY
                    p.project_id, p.project_name;
            `,
            values : [ workspace_id, user_id ]
        })

        return projects.rows;

    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }

}

export const getUserProjects = async ( user_id : string, postgreClient? : PoolClient ) => {

    try {
        const {
            client,
            release
        } = await getPoolClient(postgreClient);

        const projects = await client.query({
            text : `--sql
                SELECT
                    p.project_id,
                    p.project_name,
                    json_agg(
                        json_build_object(
                            'user_id', u.user_id,
                            'email', u.email,
                            'firstname', u.firstname,
                            'lastname', u.lastname,
                            'project_role', pm.project_role,
                            'joined_at', pm.joined_at,
                            'is_active', pm.is_active
                        )
                    ) as project_members
                FROM
                    public."project_members" pm
                JOIN
                    public."project" p ON pm.project_id = p.project_id
                JOIN
                    public."user" u ON pm.user_id = u.user_id
                WHERE
                    pm.user_id = $1
                GROUP BY
                    p.project_id, p.project_name;
            `,
            values : [ user_id ]
        })

        release()

        return projects.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const getProjectMember = async ( project_id : string, user_id : string, poolClient? : PoolClient ) => {
    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const projectMember = await client.query({
            text : `--sql
                SELECT
                    *
                FROM
                    public."project_members"
                WHERE
                    project_id = $1 AND user_id = $2
            `,
            values : [ project_id, user_id ]
        })
        return projectMember.rows[0]
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }
}

export const getProjectMemberByTaskboardId = async ( task_board_id : string, user_id : string, poolClient? : PoolClient ) : Promise<TProjectMember | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const projectMember = await client.query({
            text : `--sql
                SELECT
                    pm.*
                FROM
                    public."task_board" tb
                JOIN
                    public."project" p ON tb.project_id = p.project_id
                JOIN
                    public."project_members" pm ON p.project_id = pm.project_id
                WHERE
                    tb.task_board_id = $1 AND pm.user_id = $2
            `,
            values : [ task_board_id, user_id ]
        })
        return projectMember.rows[0]
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }

}

export const getProjectMemberByTaskSectionId = async ( task_section_id : string, user_id : string, poolClient? : PoolClient ) : Promise<TProjectMember | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const projectMember = await client.query({
            text : `--sql
                SELECT
                    pm.*
                FROM
                    public."task_section" ts
                JOIN
                    public."task_board" tb ON tb.task_board_id = ts.task_board_id
                JOIN
                    public."project" p ON tb.project_id = p.project_id
                JOIN
                    public."project_members" pm ON p.project_id = pm.project_id
                WHERE
                    ts.task_section_id = $1 AND pm.user_id = $2;
            `,
            values : [ task_section_id, user_id ]
        })   
        return projectMember.rows[0]
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }

}

export const getProjectMemberByTaskId = async (
    task_id : string,
    user_id : string,
    poolClient? : PoolClient
) : Promise<TProjectMember | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const projectMember = await client.query({
            text : `--sql
                SELECT
                    pm.*
                FROM
                    public."task" t
                JOIN
                    public."task_section" ts ON ts.task_section_id = t.task_section_id
                JOIN
                    public."task_board" tb ON tb.task_board_id = ts.task_board_id
                JOIN
                    public."project" p ON tb.project_id = p.project_id
                JOIN
                    public."project_members" pm ON p.project_id = pm.project_id
                WHERE
                    t.task_id = $1 AND pm.user_id = $2;
            `,
            values : [ task_id, user_id ]
        })
        return projectMember.rows[0]
    } catch (error) {
        console.log(error)
        throw error
    } finally {
        release()
    }

}
