import { Response, Router } from "express";
import { IAddTaskAssigneeRequest, IArrangeTaskRequest, ICreateTaskRequest, ILogTaskTimeRequest, IRemoveTaskAssigneeRequest, ITransferTaskToTrashRequest, IUpdateTaskPrimitiveFieldsRequest } from "./interfaces.js";
import { getPoolClient } from "../../database/postgresql.js";
import { addTaskAssignee, arrangeTask, createTask, logTaskTime, removeTaskAssignee, transferTaskToTrash, updateTaskPrimitiveFields } from "../../database/queries/task/mutation.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { getTask, getTaskPath } from "../../database/queries/task/query.js";
import { TTaskCreateWebSocketMessage } from "../../websocket/types.js";
import { getProjectMemberByTaskId } from "../../database/queries/project/query.js";

export const registerTaskRoutes = ( router : Router ) => {

    // Get Task
    router.get(
        `/:task_id`,
        async ( req : IAuthenticatedRequest, res : Response ) => {
            const { task_id } = req.params;
            const { user_id } = req.user;

            if ( !task_id ) {
                res.status(400).json({
                    message : "Task ID is required"
                })
                return
            }

            try {
                const projectMember = await getProjectMemberByTaskId( task_id, req.user.user_id )
                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }
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

    // Create task
    router.post(
        `/`,
        async ( req : ICreateTaskRequest, res : Response ) => {
            const body = req.body

            const {
                client,
                release
            } = await getPoolClient()

            try {
                await client.query("BEGIN")

                const createdTask = await createTask(
                    body.task_section_id,
                    body.task_title,
                    req.user.user_id,
                    client
                )

                await client.query("COMMIT")

                const path = await getTaskPath( createdTask.task_id, client )

                const message : TTaskCreateWebSocketMessage = {
                    task : createdTask,
                    path : {
                        workspace_id : path.workspace_id,
                        project_id : path.project_id,
                        board_id : path.task_board_id
                    }
                }

                res.status(201).json(createdTask)

            } catch (error) {
                console.log(error)
                await client.query("ROLLBACK")
                res.status(500).json({
                    message : "Internal server error"
                })
            } finally {
                release()
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
                    message : "Task assignee added"
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

            let release : () => void
            
            try {
                
                const {
                    client,
                    release : clientRelease
                } = await getPoolClient()

                release = clientRelease;

                const projectMember = await getProjectMemberByTaskId( task_id, user_id, client )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

                await client.query("BEGIN")

                const loggedTaskTime = await logTaskTime(
                    task_id,
                    user_id,
                    time_spent,
                    client
                )

                await client.query("COMMIT")

                res.status(200).json( loggedTaskTime )

            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message : "Internal server error"
                })
            } finally {
                release?.()
            }
        }
    )

    // Arrange task
    router.patch(
        `/:task_id`,
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
        async ( req : IUpdateTaskPrimitiveFieldsRequest, res : Response ) => {

            const { task_id } = req.params
            const body = req.body
            const { user_id } = req.user

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
                
                const projectMember = await getProjectMemberByTaskId( task_id, user_id )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }
                
                const updatedTask = await updateTaskPrimitiveFields(
                    task_id,
                    body
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

    // Transfer task to trash
    router.patch(
        `/trash/:task_id`,
        async ( req : ITransferTaskToTrashRequest, res : Response ) => {

            const { task_id } = req.params
            const { user_id } = req.user

            try {

                const projectMember = await getProjectMemberByTaskId( task_id, user_id )

                if ( !projectMember ) {
                    res.status(403).json({
                        message : "Forbidden"
                    })
                    return
                }

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

}