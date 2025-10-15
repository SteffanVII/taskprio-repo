import { DB, ETagSortBy, TTag } from "@repo/taskprio-types";
import { databaseFunctionWrapper, EDatabaseFunction } from "../../postgresql.js";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql, Transaction } from "kysely";

export const getProjectTags = async (
    projectId : string,
    sortBy? : ETagSortBy,
    sortDirection? : "asc" | "desc",
    trx? : Transaction<DB>
) : Promise<TTag[]> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project_tags" ) : taskprioKysely.selectFrom( "project.project_tags" )

    const tags = await queryBuilder
        .select([
            "tag_name",
            "tag_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tag_id)`.as( "tag_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .where( "project.project_tags.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .orderBy( sql`project.project_tags.${sql.raw(sortBy || ETagSortBy.TAG_NAME)}`, sortDirection || "asc" )
        .execute()

    return tags;

}

// export const getProjectTags = databaseFunctionWrapper(
//     async (
//         client,
//         project_id : string,
//         sort_by? : ETagSortBy
//     ) : Promise<TTag[]> => {

//         const tags = await client.query({
//             text : `--sql
//                 SELECT
//                     tag_name,
//                     tag_color,
//                     public.uuid_to_base64(tag_id) AS tag_id,
//                     public.uuid_to_base64(project_id) AS project_id
//                 FROM project."project_tags"
//                 WHERE project_id = public.detect_and_convert_to_uuid($1)
//                 ORDER BY ${sort_by || ETagSortBy.TAG_NAME} ASC
//             `,
//             values : [
//                 project_id
//             ]
//         })

//         return tags.rows;

//     }
// )

export const getTagById = async (
    tagId : string,
    trx? : Transaction<DB>
) : Promise<TTag | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "project.project_tags" ) : taskprioKysely.selectFrom( "project.project_tags" )

    const tag = await queryBuilder
        .select([
            "tag_name",
            "tag_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tag_id)`.as( "tag_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .where( "project.project_tags.tag_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${tagId})` )
        .executeTakeFirst()

    return tag;
}

// export const getTagById = databaseFunctionWrapper(
//     async (
//         client,
//         tag_id : string
//     ) : Promise<TTag | undefined> => {

//         const tag = await client.query({
//             text : `--sql
//                 SELECT
//                     tag_name,
//                     tag_color,
//                     public.uuid_to_base64(tag_id) AS tag_id,
//                     public.uuid_to_base64(project_id) AS project_id
//                 FROM project."project_tags"
//                 WHERE tag_id = public.detect_and_convert_to_uuid($1)
//             `,
//             values : [
//                 tag_id
//             ]
//         })

//         return tag.rows[0]

//     }
// )