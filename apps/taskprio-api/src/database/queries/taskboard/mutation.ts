import { PoolClient } from "pg"
import { getPoolClient } from "../../postgresql.js"
import slugify from "slugify"
import { Request } from "express"
import { createTaskSection } from "../tasksection/mutation.js"
import { TTaskboard } from "@repo/taskprio-types"


export const createTaskboard = async (
    project_id : string,
    taskboard_name : string,
    user_id : string,
    req : Request,
    poolClient? : PoolClient
) : Promise<TTaskboard | undefined> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        const taskboardSlug = slugify.default(
            `${taskboard_name}${Date.now()}`,
            {
                lower : true,
                strict : true,
                locale : req.headers['accept-language']?.split(',')[0] || 'en',
                remove : /[*+~.()'"!:@]/g,
            }
        )

        if ( internalClient) await client.query("BEGIN")

        const createdTaskboard = await client.query({
            text : `--sql
                INSERT INTO public."task_board" (
                    task_board_name,
                    task_board_slug,
                    project_id
                ) VALUES (
                    $1,
                    $2,
                    $3
                ) RETURNING *;
            `,
            values : [ taskboard_name, taskboardSlug, project_id ]
        })

        const toDoTaskSection = await createTaskSection(
            createdTaskboard.rows[0].task_board_id,
            "To Do",
            1,
            client
        )

        const inProgressTaskSection = await createTaskSection(
            createdTaskboard.rows[0].task_board_id,
            "In Progress",
            toDoTaskSection.display_order + 100,
            client
        )

        await createTaskSection(
            createdTaskboard.rows[0].task_board_id,
            "Done",
            inProgressTaskSection.display_order + 100,
            client
        )

        if ( internalClient ) await client.query("COMMIT")

        return createdTaskboard.rows[0] as TTaskboard;
        
    } catch (error) {
        console.log(error);
        if ( internalClient ) await client.query("ROLLBACK")
        throw error;
    } finally {
        release()
    }
}