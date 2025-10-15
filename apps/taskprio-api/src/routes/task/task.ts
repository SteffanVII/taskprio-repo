import { Response, Router } from "express";
import { IAddTaskAssigneeRequest, IAddTaskCommentRequest, IAddTaskTagRequest, IArrangeTaskRequest, ICreateTaskRequest, IGetTaskCommentsRequest, IGetTaskRequest, ILogTaskTimeRequest, IMoveTaskToTrashRequest, IRemoveTaskAssigneeRequest, IRemoveTaskTagRequest, IRestoreTaskFromTrashRequest, ITransferTaskToTrashRequest, IUpdateTaskPrimitiveFieldsRequest } from "./interfaces.js";
import { getPoolClient } from "../../database/postgresql.js";
import { addTaskAssignee, addTaskComment, arrangeTask, createTask, logTaskTime, removeTaskAssignee, restoreTaskFromTrash, transferTaskToTrash, updateTaskPrimitiveFields } from "../../database/queries/task/mutation.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { getTask, getTaskComments } from "../../database/queries/task/query.js";
import { TTask, TTaskCreateWebSocketMessageSimple } from "@repo/taskprio-types";
import { getProjectMemberByTaskId } from "../../database/queries/project/query.js";
import { EWebSocketEventType } from "@repo/taskprio-types";
import { getWorkspaceIdFromProjectId } from "../../database/queries/workspace/query.js";
import { verifyProjectMemberMiddleware } from "../../middlewares/authentication.js";
import { WebSocketConnectionsManagerSimple } from "../../websocket/connectionsManager.js";
import { taskprioKysely } from "../../database/kysely/kysely.js";
import { addTaskTag, removeTaskTag } from "../../database/queries/tag/mutation.js";

export const registerTaskRoutes = ( router : Router, wsConnectionsManagerSimple : WebSocketConnectionsManagerSimple ) => {

    // GET Routes
    // Get Task
    router.get(
        `/:task_id`,
        verifyProjectMemberMiddleware,
        async ( req : IGetTaskRequest, res : Response ) => {
            const { task_id } = req.params;
            const { user_id } = req.user;

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            try {
                const task = await getTask(task_id, user_id)
                res.status(200).json(task)
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }
        }
    )

    // Get task comments
    router.get(
        `/comments/:task_id`,
        verifyProjectMemberMiddleware,
        async ( req : IGetTaskCommentsRequest, res : Response ) => {

            const { task_id } = req.params

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            try {
                const comments = await getTaskComments( task_id )
                res.status(200).json(comments)
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    // POST Routes
    // Create task
    router.post(
        `/`,
        verifyProjectMemberMiddleware,
        async ( req : ICreateTaskRequest, res : Response ) => {
            const body = req.body

            try {

                let transactionReturn : {
                    createdTask : TTask,
                    workspaceId : string
                }

                transactionReturn = await taskprioKysely.transaction().execute( async trx => {

                    const createdTask = await createTask(
                        body.task_section_id,
                        body.task_title,
                        req.user.user_id,
                        trx
                    )

                    const workspaceId = await getWorkspaceIdFromProjectId( req.projectId, trx );

                    return {
                        createdTask,
                        workspaceId
                    }

                } )

                const message : TTaskCreateWebSocketMessageSimple = {
                    data : transactionReturn.createdTask,
                    workspace_id : transactionReturn.workspaceId
                }

                wsConnectionsManagerSimple.sendMessage(
                    {
                        type : EWebSocketEventType.TASK_CREATED,
                        data : message
                    },
                    [ req.user.user_id ],
                    transactionReturn.workspaceId
                )

                res.status(201).json(transactionReturn.createdTask)

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    // Add task assignee
    router.post(
        `/assignee/:task_id`,
        async ( req : IAddTaskAssigneeRequest, res : Response ) => {

            const { task_id } = req.params
            const { user_id : target_user_id } = req.body
            const { user_id : source_user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !target_user_id ) {
                res.status(400).json({
                    message : "Target user ID is required"
                })
                return
            }

            try {
                
                const targetProjectMember = await getProjectMemberByTaskId( task_id, target_user_id )
                const sourceProjectMember = await getProjectMemberByTaskId( task_id, source_user_id )

                if ( !targetProjectMember ) {
                    res.status(403).json({
                        message : "Target user is not a project member"
                    })
                    return
                }

                if ( !sourceProjectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                }

                await addTaskAssignee( task_id, target_user_id )

                res.status(200).json({
                    message : "Task assignee added",
                })

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    // Log task time
    router.post(
        `/log-time/:task_id`,
        async ( req : ILogTaskTimeRequest, res : Response ) => {

            const { task_id } = req.params
            const { time_spent } = req.body
            const { user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( time_spent === undefined ) {
                res.status(400).json({
                    message : "Time spent is required"
                })
                return
            }

            if ( time_spent <= 0 ) {
                res.status(400).json({
                    message : "Time spent must be greater than 0"
                })
                return
            }

            try {


                const projectMember = await getProjectMemberByTaskId( task_id, user_id )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

                const loggedTaskTime = await logTaskTime(
                    task_id,
                    user_id,
                    time_spent
                )

                res.status(200).json( loggedTaskTime )

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }
        }
    )

    // Add task tag
    router.post(
        `/tag`,
        async ( req : IAddTaskTagRequest, res : Response ) => {
            
            const { task_id, tag_id } = req.body
            const { user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !tag_id ) {
                res.status(400).json({
                    message : "Tag ID is required"
                })
                return
            }

            try {

                const projectMember = await getProjectMemberByTaskId( task_id, user_id )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

                const addedTaskTag = await addTaskTag( task_id, tag_id )

                res.status(200).json(addedTaskTag)
                

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : error
                })
            }

        }
    )

    // Add task comment
    router.post(
        `/comment/:task_id`,
        verifyProjectMemberMiddleware,
        async ( req : IAddTaskCommentRequest, res : Response ) => {

            const { task_id } = req.params
            const { comment_content, replying_to_task_comment_id } = req.body
            const { user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !comment_content ) {
                res.status(400).json({
                    message : "Comment content is required"
                })
                return
            }

            try {
                await addTaskComment( task_id, user_id, comment_content, replying_to_task_comment_id )
                res.status(200).json({
                    message : "Task comment added"
                })
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    // PATCH Routes
    // Arrange task
    router.patch(
        `/move/:task_id`,
        async ( req : IArrangeTaskRequest, res : Response ) => {
            const { task_id } = req.params
            const body = req.body
            const { user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            try {

                const projectMember = await getProjectMemberByTaskId( task_id, user_id )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

                const updatedTask = await arrangeTask(
                    task_id,
                    body
                )
                res.status(200).json(updatedTask)
                
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }
        }
    )

    // Update task primitive fields
    router.patch(
        `/primitive-fields/:task_id`,
        verifyProjectMemberMiddleware,
        async ( req : IUpdateTaskPrimitiveFieldsRequest, res : Response ) => {

            const { task_id } = req.params
            const body = req.body
            const { user_id } = req.user
            const projectId = req.projectId;

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !body || Object.keys(body).length === 0 ) {
                res.status(400).json({
                    message : "Body is required"
                })
                return
            }

            if ( body.task_title === null ) {
                res.status(400).json({
                    message : "Task title cannot be null"
                })
                return
            }

            try {
                
                const updatedTask = await updateTaskPrimitiveFields(
                    task_id,
                    body
                )

                const workspaceId = await getWorkspaceIdFromProjectId( projectId );

                wsConnectionsManagerSimple.sendMessage(
                    {
                        type : EWebSocketEventType.TASK_UPDATED,
                        data : updatedTask
                    },
                    [ user_id ],
                    workspaceId
                )

                res.status(200).json( updatedTask )

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    // Restore task from trash
    router.patch(
        `/restore-from-trash/:task_id/:taskboard_id`,
        async ( req : IRestoreTaskFromTrashRequest, res : Response ) => {

            const { task_id, taskboard_id } = req.params

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !taskboard_id ) {
                res.status(400).json({
                    message : "Taskboard ID is required"
                })
                return
            }

            try {
                await restoreTaskFromTrash( task_id, taskboard_id )
                res.status(200).json({
                    message : "Task restored from trash"
                })
            } catch (error) {
                console.log(error)
                if ( error.message === "There is no task section available to restore the task to" || error.message === "Task not found" ) {
                    res.status(404).json({
                        message : error.message
                    })
                } else {
                    res.status(500).json({
                        message : "Internal server error"
                    })
                }
            }

        }
    )

    // DELETE Routes
    // Remove task assignee
    router.delete(
        `/assignee/:task_id`,
        async ( req : IRemoveTaskAssigneeRequest, res : Response ) => {

            const { task_id } = req.params
            const { user_id : target_user_id } = req.body
            const { user_id : source_user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !target_user_id ) {
                res.status(400).json({
                    message : "Target user ID is required"
                })
            }

            try {
                
                const targetProjectMember = await getProjectMemberByTaskId( task_id, target_user_id )
                const sourceProjectMember = await getProjectMemberByTaskId( task_id, source_user_id )

                if ( !targetProjectMember ) {
                    res.status(403).json({
                        message : "Target user is not a project member"
                    })
                    return
                }

                if ( !sourceProjectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

                await removeTaskAssignee( task_id, target_user_id )

                res.status(200).json({
                    message : "Task assignee removed"
                })
                
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }
        }
    )

    // Remove task tag
    router.delete(
        `/tag`,
        async ( req : IRemoveTaskTagRequest, res : Response ) => {

            const { task_id, tag_id } = req.body
            const { user_id } = req.user

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            if ( !tag_id ) {
                res.status(400).json({
                    message : "Tag ID is required"
                })
                return
            }

            try {

                await removeTaskTag( task_id, tag_id )

                res.status(200).json({
                    message : "Task tag removed"
                })

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : error
                })
            }

        }
    )

    // Move task to trash
    router.delete(
        `/trash/:task_id`,
        async ( req : IMoveTaskToTrashRequest, res : Response ) => {

            const {
                task_id
            } = req.params

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }
            
            try {
                await transferTaskToTrash( task_id )
                res.status(200).json({
                    message : "Task moved to trash"
                })
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

}