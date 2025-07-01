import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TTaskPath } from "@repo/taskprio-types";

export const getTaskLastDisplayOrder = async (
    task_section_id : string,
    poolClient? : PoolClient
) => {

    const {
        client,
        release
    } = await getPoolClient( poolClient )

    try {
        const lastDisplayOrder = await client.query({
            text : `--sql
                SELECT COALESCE(MAX(display_order), -99) AS last_display_order
                FROM taskboard."task" t
                WHERE t.task_section_id = $1;
            `,
            values : [task_section_id]
        })
        return lastDisplayOrder.rows[0].last_display_order
    } catch (error) {
        console.log(error)
        throw error
    } finally {
        release()
    }

}

export const getTask = async (
    task_id : string,
    user_id : string,
    poolClient? : PoolClient
) => {

    const {
        client,
        release
    } = await getPoolClient( poolClient )

    try {

        const task = await client.query({
            text : `--sql
                SELECT
                    t.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'user_id', ta.user_id,
                                'firstname', u.firstname,
                                'lastname', u.lastname
                            )
                        ) FILTER ( WHERE u.user_id IS NOT NULL ), '[]'
                    ) as assignees,
                    (
                        SELECT COALESCE(json_agg(ttl ORDER BY ttl.created_at DESC ), '[]')
                        FROM taskboard."task_time_log" ttl
                        WHERE ttl.task_id = t.task_id AND ttl.user_id = $2
                    ) as task_time_logs
                FROM taskboard."task" t
                LEFT JOIN taskboard."task_assignee" ta ON t.task_id = ta.task_id
                LEFT JOIN tp_user."user" u ON ta.user_id = u.user_id
                WHERE t.task_id = $1
                GROUP BY
                    t.task_id,
                    t.task_section_id,
                    t.task_title,
                    t.task_description,
                    t.task_estimate,
                    t.display_order,
                    t.created_at,
                    t.created_by
            `,
            values : [task_id, user_id]
        })

        return task.rows[0]

    } catch (error) {
        console.log(error)
        throw error
    } finally {
        release()
    }

}

export const getTaskPath = async (
    task_id : string,
    poolClient? : PoolClient
) : Promise<TTaskPath | undefined> => {

    const {
        client,
        release
    } = await getPoolClient( poolClient )

    try {
        const path = await client.query({
            text : `--sql
                SELECT
                    wp.workspace_id,
                    p.project_id,
                    tb.task_board_id,
                    ts.task_section_id
                FROM taskboard."task" t
                JOIN taskboard."task_section" ts ON t.task_section_id = ts.task_section_id
                JOIN taskboard."task_board" tb ON ts.task_board_id = tb.task_board_id
                JOIN project."project" p ON tb.project_id = p.project_id
                JOIN project."workspace_projects" wp ON p.project_id = wp.project_id
                WHERE t.task_id = $1;
            `,
            values : [ task_id ]
        })
        return path.rows[0]
    } catch (error) {
        console.log(error)
        throw error
    } finally {
        release()
    }

}