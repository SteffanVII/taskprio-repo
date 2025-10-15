import { EDatabaseFunction } from "../../postgresql.js";
import { DB, ProjectProjectTags, TTag, TTaskTag } from "@repo/taskprio-types";
import { taskprioKysely } from "../../kysely/kysely.js";
import { sql, Updateable } from "kysely";
import { Transaction } from "kysely";

// export const createProjectTag = databaseFunctionWrapper(
//     async (
//         client : PoolClient,
//         project_id : string,
//         tag_name : string,
//         tag_color : string
//     ) : Promise<TTag> => {

//         await client.query("BEGIN");

//         const tag = await client.query({
//             text : `--sql
//                 INSERT INTO project."project_tags" (
//                     tag_name,
//                     tag_color,
//                     project_id
//                 ) VALUES (
//                     $1,
//                     $2,
//                     public.detect_and_convert_to_uuid($3)
//                 )
//                 RETURNING
//                     tag_name,
//                     tag_color,
//                     public.uuid_to_base64(tag_id) AS tag_id,
//                     public.uuid_to_base64(project_id) AS project_id
//             `,
//             values : [
//                 tag_name,
//                 tag_color,
//                 project_id
//             ]
//         })

//         await client.query("COMMIT");

//         return tag.rows[0]

//     }
// )

export const createProjectTag = async (
    projectId : string,
    tagName : string,
    tagColor : string,
    trx? : Transaction<DB>
) : Promise<TTag> => {

    const queryBuilder = trx ? trx.insertInto( "project.project_tags" ) : taskprioKysely.insertInto( "project.project_tags" )

    const tag = await queryBuilder
        .values({
            tag_name : tagName,
            tag_color : tagColor,
            project_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})`
        })
        .returning([
            "tag_name",
            "tag_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tag_id)`.as( "tag_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .executeTakeFirstOrThrow()

    return tag;
}

export const updateProjectTag = async (
    projectId : string,
    tagId : string,
    tagName? : string,
    tagColor? : string,
    trx? : Transaction<DB>
) : Promise<TTag> => {

    const queryBuilder = trx ? trx.updateTable( "project.project_tags" ) : taskprioKysely.updateTable( "project.project_tags" )

    const setValues : Updateable<ProjectProjectTags> = {};

    if ( tagName ) {
        setValues.tag_name = tagName;
    }

    if ( tagColor ) {
        setValues.tag_color = tagColor;
    }

    const tag = await queryBuilder
        .set( setValues )
        .where( "project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "tag_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${tagId})` )
        .returning([
            "tag_name",
            "tag_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tag_id)`.as( "tag_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .executeTakeFirstOrThrow()

    return tag;
}

// export const updateProjectTag = databaseFunctionWrapper(
//     async (
//         client : PoolClient,
//         project_id : string,
//         tag_id : string,
//         tag_name? : string,
//         tag_color? : string
//     ) : Promise<TTag> => {

//         const setClauses = clausesOrganizer()
//         const whereClauses = clausesOrganizer()

//         if ( tag_name ) {
//             setClauses.push("tag_name", tag_name)
//         }

//         if ( tag_color ) {
//             setClauses.push("tag_color", tag_color)
//         }

//         whereClauses.push("project_id", project_id)
//         whereClauses.push("tag_id", tag_id)

//         const tag = await client.query({
//             text : `--sql
//                 UPDATE project."project_tags"
//                 SET
//                     ${setClauses.joinClausesAndValueIndex()}
//                 WHERE
//                     ${whereClauses.joinClausesAndValueIndex("AND", setClauses.values.length)}
//                 RETURNING
//                     tag_name,
//                     tag_color,
//                     public.uuid_to_base64(tag_id) AS tag_id,
//                     public.uuid_to_base64(project_id) AS project_id
//             `,
//             values : [
//                 ...setClauses.values,
//                 ...whereClauses.values
//             ]
//         })

//         return tag.rows[0]

//     }
// )

export const deleteProjectTag = async (
    projectId : string,
    tagId : string,
    trx? : Transaction<DB>
) : Promise<TTag | undefined> => {

    const deletedTag = await (trx ? trx.deleteFrom( "project.project_tags" ) : taskprioKysely.deleteFrom( "project.project_tags" ))
        // .where( "project.project_tags.project_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${projectId})` )
        .where( "project.project_tags.tag_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${tagId})` )
        .returning([
            "tag_name",
            "tag_color",
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tag_id)`.as( "tag_id" ),
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(project_id)`.as( "project_id" )
        ])
        .executeTakeFirst()

    return deletedTag;
}


// export const deleteProjectTag = databaseFunctionWrapper(
//     async (
//         client,
//         project_id : string,
//         tag_id : string
//     ) : Promise<TTag | undefined> => {

//         const tag = await client.query({
//             text : `--sql
//                 DELETE FROM project."project_tags"
//                 WHERE
//                     project_id = public.detect_and_convert_to_uuid($1)
//                     AND tag_id = public.detect_and_convert_to_uuid($2)
//                 RETURNING
//                     tag_name,
//                     tag_color,
//                     public.uuid_to_base64(tag_id) AS tag_id,
//                     public.uuid_to_base64(project_id) AS project_id
//             `,
//             values : [
//                 project_id,
//                 tag_id
//             ]
//         })

//         return tag.rows[0]

//     }
// )

export const addTaskTag = async (
    taskId : string,
    tagId : string,
    trx? : Transaction<DB>
) : Promise<TTaskTag> => {

    let returnValue : TTaskTag;

    const query = async ( trxFinal : Transaction<DB> ) => {

        const createdTagJoin = await trxFinal.insertInto( "taskboard.task_tag" )
            .values({
                task_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})`,
                tag_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${tagId})`
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        return await trxFinal.selectFrom( "taskboard.task_tag" )
            .innerJoin( "project.project_tags", "taskboard.task_tag.tag_id", "project.project_tags.tag_id" )
            .select([
                "project.project_tags.tag_name",
                "project.project_tags.tag_color",
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.tag_id)`.as( "tag_id" ),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(taskboard.task_tag.task_id)`.as( "task_id" )
            ])
            .where( "taskboard.task_tag.tag_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdTagJoin.tag_id}::text)` )
            .where( "taskboard.task_tag.task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${createdTagJoin.task_id}::text)` )
            .executeTakeFirstOrThrow()

    }

    if ( trx ) {
        returnValue = await query( trx );
    } else {
        returnValue = await taskprioKysely.transaction().execute( async trxInner => {
            return await query( trxInner );
        } )
    }

    return returnValue;

}

export const removeTaskTag = async (
    taskId : string,
    tagId : string,
    trx? : Transaction<DB>
) : Promise<void> => {

    const queryBuilder = trx ? trx.deleteFrom( "taskboard.task_tag" ) : taskprioKysely.deleteFrom( "taskboard.task_tag" )

    await queryBuilder
        .where( "task_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${taskId})` )
        .where( "tag_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${tagId})` )
        .execute();

}