import { TTag } from "@repo/taskprio-types";
import { databaseFunctionWrapper } from "../../postgresql.js";


export const getProjectTags = databaseFunctionWrapper(
    async (
        client,
        project_id : string,
        sort_by? : "tag_name" | "created_at" | "updated_at"
    ) : Promise<TTag[]> => {

        const tags = await client.query({
            text : `--sql
                SELECT * FROM project."project_tags"
                WHERE project_id = $1
                ORDER BY "tag_name" ASC
            `,
            values : [
                project_id
            ]
        })

        return tags.rows;

    }
)

export const getTagById = databaseFunctionWrapper(
    async (
        client,
        tag_id : string
    ) : Promise<TTag | undefined> => {

        const tag = await client.query({
            text : `--sql
                SELECT * FROM project."project_tags"
                WHERE tag_id = $1
            `,
            values : [
                tag_id
            ]
        })

        return tag.rows[0]

    }
)