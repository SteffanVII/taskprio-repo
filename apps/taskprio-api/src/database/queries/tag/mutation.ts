import { PoolClient } from "pg";
import { clausesOrganizer, databaseFunctionWrapper } from "../../postgresql.js";
import { TTag } from "@repo/taskprio-types";

export const createProjectTag = databaseFunctionWrapper(
    async (
        client : PoolClient,
        project_id : string,
        tag_name : string,
        tag_color : string
    ) : Promise<TTag> => {

        await client.query("BEGIN");

        const tag = await client.query({
            text : `--sql
                INSERT INTO project."project_tags" (
                    tag_name,
                    tag_color,
                    project_id
                ) VALUES ($1, $2, $3)
                RETURNING *
            `,
            values : [
                tag_name,
                tag_color,
                project_id
            ]
        })

        await client.query("COMMIT");

        return tag.rows[0]

    }
)

export const updateProjectTag = databaseFunctionWrapper(
    async (
        client : PoolClient,
        project_id : string,
        tag_id : string,
        tag_name? : string,
        tag_color? : string
    ) : Promise<TTag> => {

        const setClauses = clausesOrganizer()
        const whereClauses = clausesOrganizer()

        if ( tag_name ) {
            setClauses.push("tag_name", tag_name)
        }

        if ( tag_color ) {
            setClauses.push("tag_color", tag_color)
        }

        whereClauses.push("project_id", project_id)
        whereClauses.push("tag_id", tag_id)

        const tag = await client.query({
            text : `--sql
                UPDATE project."project_tags"
                SET
                    ${setClauses.joinClausesAndValueIndex()}
                WHERE
                    ${whereClauses.joinClausesAndValueIndex("AND", setClauses.values.length)}
                RETURNING *
            `,
            values : [
                ...setClauses.values,
                ...whereClauses.values
            ]
        })

        return tag.rows[0]

    }
)

export const deleteProjectTag = databaseFunctionWrapper(
    async (
        client,
        project_id : string,
        tag_id : string
    ) : Promise<TTag | undefined> => {

        const tag = await client.query({
            text : `--sql
                DELETE FROM project."project_tags"
                WHERE project_id = $1 and tag_id = $2
                RETURNING *
            `,
            values : [
                project_id,
                tag_id
            ]
        })

        return tag.rows[0]

    }
)