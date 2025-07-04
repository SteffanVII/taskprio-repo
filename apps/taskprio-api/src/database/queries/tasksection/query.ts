import { PoolClient } from "pg"
import { getPoolClient } from "../../postgresql.js"
import { TTaskSection, TTaskSectionWithTasks } from "@repo/taskprio-types"

export const getTaskboardSections = async (
    task_board_id : string,
    poolClient? : PoolClient
) : Promise<TTaskSection[] | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        const taskboardSections = await client.query({
            text : `--sql
                SELECT * FROM taskboard."task_section" WHERE task_board_id = $1;
            `,
            values : [ task_board_id ]
        })

        return taskboardSections.rows as TTaskSection[];
        
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }
}

export const getTaskboardSectionsWithTasksForCardView = async (
    task_board_id : string,
    poolClient? : PoolClient
) : Promise<TTaskSectionWithTasks[] | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        const taskboardSections = await client.query({
            text : `--sql
                WITH task_with_assignees AS (
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
                        ) as assignees
                    FROM taskboard."task" t
                    LEFT JOIN taskboard."task_assignee" ta ON t.task_id = ta.task_id
                    LEFT JOIN tp_user."user" u ON ta.user_id = u.user_id
                    GROUP BY
                        t.task_id,
                        t.task_section_id,
                        t.task_title,
                        t.task_description,
                        t.task_estimate,
                        t.task_deadline,
                        t.display_order,
                        t.created_at,
                        t.created_by
                )
                SELECT
                    ts.*,
                    COALESCE(
                        json_agg(
                            twa ORDER BY twa.display_order DESC
                        ) FILTER ( WHERE twa.task_id IS NOT NULL ), '[]'
                    ) as tasks
                FROM
                    taskboard."task_section" ts
                LEFT JOIN
                    task_with_assignees twa ON ts.task_section_id = twa.task_section_id
                WHERE ts.task_board_id = $1
                GROUP BY
                    ts.task_section_id,
                    ts.task_section_name,
                    ts.task_board_id,
                    ts.display_order,
                    ts.created_at
                ORDER BY
                    ts.display_order ASC;
            `,
            values : [ task_board_id ]
        })

        return taskboardSections.rows as TTaskSectionWithTasks[];
        
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }
}

export const getLastTaskboardSectionDisplayOrder = async (
    task_board_id : string,
    poolClient? : PoolClient
) : Promise<number | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        const lastTaskboardSection = await client.query({
            text : `--sql
                SELECT
                    COALESCE(MAX(display_order), -99) as display_order
                FROM
                    taskboard."task_section" ts
                WHERE
                    ts.task_board_id = $1;
            `,
            values : [ task_board_id ]
        })

        return lastTaskboardSection.rows[0].display_order;

    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }
}