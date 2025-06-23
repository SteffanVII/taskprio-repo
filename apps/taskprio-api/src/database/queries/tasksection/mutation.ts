import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TTaskSection, TUpdateTaskboardSectionRequestBody } from "@repo/taskprio-types";

export const createTaskSection = async (
    task_board_id : string,
    task_section_name : string,
    display_order : number,
    poolClient? : PoolClient
) : Promise<TTaskSection | undefined> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        if ( internalClient ) await client.query("BEGIN")

        const createdTaskSection = await client.query({
            text : `--sql
                INSERT INTO public."task_section" (
                    task_section_name,
                    task_board_id,
                    display_order
                ) VALUES (
                    $1,
                    $2,
                    $3
                ) RETURNING *;
            `,
            values : [ task_section_name, task_board_id, display_order ]
        })

        if ( internalClient ) await client.query("COMMIT")

        return createdTaskSection.rows[0] as TTaskSection;

    } catch (error) {
        console.log(error);
        if ( internalClient ) await client.query("ROLLBACK")
        throw error;
    } finally {
        release()
    }
}

export const updateTaskSection = async (
    task_section_id : string,
    body : TUpdateTaskboardSectionRequestBody,
    poolClient? : PoolClient
) : Promise<TTaskSection> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        if ( internalClient ) await client.query("BEGIN") 

        const clauses = []
        const values = []
        let paramIndex = 1

        if ( body.task_section_name ) {
            clauses.push(`task_section_name = $${paramIndex++}`)
            values.push(body.task_section_name)
        }

        if ( body.display_order ) {
            clauses.push(`display_order = $${paramIndex++}`)
            values.push(body.display_order)
        }

        const updatedTaskSection = await client.query({
            text : `--sql
                UPDATE public."task_section"
                SET ${clauses.join(", ")}
                WHERE task_section_id = $${paramIndex}
                RETURNING *;
            `,
            values : [ ...values, task_section_id ]
        })

        if ( internalClient ) await client.query("COMMIT")

        return updatedTaskSection.rows[0] as TTaskSection;

    } catch (error) {
        console.log(error);
        if ( internalClient ) await client.query("ROLLBACK")
        throw error;
    } finally {
        release()
    }

}