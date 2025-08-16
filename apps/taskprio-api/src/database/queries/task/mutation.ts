import { PoolClient } from "pg"
import { databaseFunctionWrapper, getPoolClient } from "../../postgresql.js"
import { getTask, getTaskLastDisplayOrder } from "./query.js"
import { TArrangeTaskRequestBody, TTask, TTaskAssignee, TTaskTimeLog, TUpdateTaskPrimitiveFieldsRequestBody } from "@repo/taskprio-types"

// export const createTask = async (
//     task_section_id : string,
//     task_name : string,
//     user_id : string,
//     poolClient? : PoolClient
// ) => {

//     const {
//         internalClient,
//         client,
//         release
//     } = await getPoolClient( poolClient )

//     try {

//         if ( internalClient ) await client.query("BEGIN")

//         const lastDisplayOrder = await getTaskLastDisplayOrder( task_section_id, client ) 

//         const createdTask = await client.query({
//             text : `--sql
//                 INSERT INTO taskboard."task" (
//                     task_section_id,
//                     task_title,
//                     display_order,
//                     created_by
//                 )
//                 VALUES (
//                     $1,
//                     $2,
//                     $3,
//                     $4
//                 )
//                 RETURNING *;
//             `,
//             values : [
//                 task_section_id,
//                 task_name,
//                 lastDisplayOrder + 100,
//                 user_id
//             ]
//         })

//         if ( internalClient ) await client.query("COMMIT")

//         const task = await getTask( createdTask.rows[0].task_id, user_id, client )
//         return task

//     } catch (error) {
//         console.log(error)
//         if ( internalClient ) await client.query("ROLLBACK")
//         throw error
//     } finally {
//         release()
//     }

// }

export const createTask = databaseFunctionWrapper(
    async (
        client : PoolClient,
        taskSectionId : string,
        taskName : string,
        userId : string

    ) : Promise<TTask> => {

        const lastDisplayOrder = await getTaskLastDisplayOrder( taskSectionId, client ) 

        const createdTask = await client.query({
            text : `--sql
                INSERT INTO taskboard."task" (
                    task_section_id,
                    task_title,
                    display_order,
                    created_by
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )
                RETURNING *;
            `,
            values : [
                taskSectionId,
                taskName,
                lastDisplayOrder + 100,
                userId
            ]
        })

        return createdTask.rows[0]

    },
    true
)

export const arrangeTask = async (
    task_id : string,
    body : TArrangeTaskRequestBody,
    poolClient? : PoolClient
) : Promise<TTask> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient( poolClient )

    try {
        
        if ( internalClient ) await client.query("BEGIN")

        const clauses = []
        const values = []
        let clauseIndex = 1

        if ( body.display_order ) {
            clauses.push(`display_order = $${clauseIndex++}`)
            values.push(body.display_order)
        }

        if ( body.task_section_id ) {
            clauses.push(`task_section_id = $${clauseIndex++}`)
            values.push(body.task_section_id)
        }

        const task = await client.query({
            text : `--sql
                UPDATE taskboard."task"
                SET ${clauses.join(", ")}
                WHERE task_id = $${clauseIndex++}
            `,
            values : [ ...values, task_id]
        })

        if ( internalClient ) await client.query("COMMIT")

        return task.rows[0]

    } catch (error) {
        console.log(error)
        if ( internalClient ) await client.query("ROLLBACK")
        throw error
    } finally {
        release()
    }

}

export const transferTaskToTrash = async (
    task_id : string,
    poolClient? : PoolClient
) : Promise<void> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {

        if ( internalClient ) await client.query("BEGIN")

        await client.query({
            text : `--sql
                UPDATE taskboard."task"
                SET in_trash = true
                WHERE task_id = $1
            `,
            values : [task_id]
        })

        if ( internalClient ) await client.query("COMMIT")
        
    } catch (error) {
        console.log(error)
        if ( internalClient ) await client.query("ROLLBACK")
        throw error
    } finally {
        release()
    }

}

export const updateTaskPrimitiveFields = async (
    task_id : string,
    body : TUpdateTaskPrimitiveFieldsRequestBody,
    poolClient? : PoolClient
) : Promise<TTask> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        if ( internalClient ) await client.query("BEGIN")

        const clauses = []
        const values = []
        let clauseIndex = 1

        if ( body.task_title ) {
            clauses.push(`task_title = $${clauseIndex++}`)
            values.push(body.task_title)
        }

        if ( body.task_description || body.task_description === null ) {
            clauses.push(`task_description = $${clauseIndex++}`)
            values.push(body.task_description)
        }

        if ( body.task_estimate || body.task_estimate === null ) {
            clauses.push(`task_estimate = $${clauseIndex++}`)
            values.push(body.task_estimate)
        }

        if ( body.task_deadline || body.task_deadline === null ) {
            clauses.push(`task_deadline = $${clauseIndex++}`)
            values.push(body.task_deadline)
        }

        const task = await client.query({
            text : `--sql
                UPDATE taskboard."task"
                SET ${clauses.join(", ")}
                WHERE task_id = $${clauseIndex}
                RETURNING *;
            `,
            values : [ ...values, task_id ]
        })

        if ( internalClient ) await client.query("COMMIT")

        return task.rows[0]

    } catch (error) {
        console.log(error)
        if ( internalClient ) await client.query("ROLLBACK")
        throw error
    } finally {
        release()
    }

}

// export const addTaskAssignee = async (
//     task_id : string,
//     user_id : string,
//     poolClient? : PoolClient
// ) : Promise<void> => {

export const addTaskAssignee = databaseFunctionWrapper(
    async (
        client,
        taskId : string,
        userId : string
    ) : Promise<TTaskAssignee> => {

        const assignee = await client.query({
            text : `--sql
                WITH
                existing_assignee AS (
                    SELECT
                        u.user_id,
                        u.firstname,
                        u.lastname
                    FROM taskboard."task_assignee" ta
                    JOIN tp_user."user" u ON u.user_id = ta.user_id
                    WHERE ta.task_id = $1 AND ta.user_id = $2
                ),
                inserted_assignee AS (
                    INSERT INTO taskboard."task_assignee" (
                        task_id,
                        user_id
                    ) VALUES ( $1, $2 )
                    WHERE NOT EXISTS ( SELECT 1 FROM existing_assignee )
                    RETURNING *
                ),
                final_assignee AS (
                    SELECT
                        u.user_id,
                        u.firstname,
                        u.lastname
                    FROM inserted_assignee ia
                    JOIN tp_user."user" u ON u.user_id = ia.user_id
                )
                SELECT * FROM existing_assignee
                UNION ALL
                SELECT * FROM final_assignee
            `,
            values : [ taskId, userId ]
        })

        return assignee.rows[0]

    }
)

export const removeTaskAssignee = async (
    task_id : string,
    user_id : string,
    poolClient? : PoolClient
) : Promise<void> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        if ( internalClient ) await client.query("BEGIN")

        await client.query({
            text : `--sql
                DELETE FROM taskboard."task_assignee"
                WHERE task_id = $1 AND user_id = $2
            `,
            values : [task_id, user_id]
        })

        if ( internalClient ) await client.query("COMMIT")

    } catch (error) {
        console.log(error)
        if ( internalClient ) await client.query("ROLLBACK")
        throw error
    } finally {
        release()
    }

}

export const logTaskTime = async (
    task_id : string,
    user_id : string,
    time_spent : number,
    poolClient? : PoolClient
) : Promise<TTaskTimeLog> => {

    const {
        internalClient,
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        
        if ( internalClient ) await client.query("BEGIN")

        const createdTaskTimeLog = await client.query({
            text : `--sql
                INSERT INTO taskboard."task_time_log" (
                    task_id,
                    user_id,
                    time_spent
                )
                VALUES ( $1, $2, $3)
                RETURNING *;
            `,
            values : [ task_id, user_id, time_spent ]
        })

        if ( internalClient ) await client.query("COMMIT")

        return createdTaskTimeLog.rows[0]

    } catch (error) {
        console.log(error)
        if ( internalClient ) await client.query("ROLLBACK")
        throw error
    } finally {
        release()
    }

}