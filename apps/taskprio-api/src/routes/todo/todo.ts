import { Router, Response } from "express";
import { IAddTaskToTodoRequest, ICommitTaskTodoRequest, ICompleteTaskTodoRequest, IFinishTaskTodoSessionRequest, IGetAvailableTasksByProjectRequest, IGetAvailableTasksByWorkspaceRequest, IGetUserTaskTodoStateRequest, IGetWorkspaceSessionHistoriesRequest, IRemoveTaskFromTodoRequest, IStartOrStopTaskTodoTimerRequest, IUpdateTaskTodoStateRequest } from "./interfaces.js";
import { verifyProjectMemberMiddleware, verifyWorkspaceMemberMiddleware } from "../../middlewares/authentication.js";
import { getTasksAssignedToUserByProjectId, getTasksAssignedToUserByWorkspaceId, getUserTaskTodoState } from "../../database/queries/task/query.js";
import { addTaskToTodo, updateTaskTodoState } from "../../database/queries/task/mutation.js";
import { commitActiveTaskTodo, finishTaskTodoSession, markActiveTodoAsComplete, startOrStopTaskTimer } from "../../database/queries/todo/mutation.js";
import { taskTodoTimerHeartbeatTimeoutManager } from "../../initializers/taskTodoTimerHeartbeatTimeoutManager.js";
import { getWorkspaceSessionHistories } from "../../database/queries/todo/query.js";

export function registerToDoRoutes( router : Router ) {

    // Get all tasks assigned to the user
    router.get(
        "/available-tasks/:workspace_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IGetAvailableTasksByWorkspaceRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { user_id } = req.user;

            if ( !workspace_id ) {
                res.status( 401 ).json({ message : "Workspace Id is required" })
            }
            
            try {
                const assignedTasks = await getTasksAssignedToUserByWorkspaceId( workspace_id, user_id, undefined, true )
                res.status(200).json(assignedTasks)
            } catch (error) {
                console.log( error )
                res.status(500).json({ message : "Internal server error" })
            }
            
        }
    )
    
    router.get(
        "/available-tasks-by-project/:project_id",
        verifyProjectMemberMiddleware,
        async ( req : IGetAvailableTasksByProjectRequest, res : Response ) => {
            
            const { project_id } = req.params;
            const { user_id } = req.user;
            const { search, taskboards } = req.query;

            const parsedTodo = !!taskboards ? JSON.parse(taskboards as unknown as string) : undefined
            
            if ( !project_id ) {
                res.status( 401 ).json({ message : "Workspace Id is required" })
            }
            
            try {
                const assignedTasks = await getTasksAssignedToUserByProjectId( project_id, user_id, { search, taskboards : parsedTodo || undefined }, true )
                res.status(200).json(assignedTasks)
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }
            
        }
    )

    // Get the user task todo state
    router.get(
        "/todo-state/:workspace_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IGetUserTaskTodoStateRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { user_id } = req.user;

            if ( !workspace_id ) {
                res.status( 401 ).json({ message : "Workspace Id is required" })
            }

            try {
                const todoState = await getUserTaskTodoState( workspace_id, user_id )
                res.status(200).json(todoState)
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Get all session history
    router.get(
        "/session-histories",
        verifyWorkspaceMemberMiddleware,
        async ( req : IGetWorkspaceSessionHistoriesRequest, res : Response ) => {
            const { workspace_id, user_ids, date_range } = req.query

            const parsedUserIds = !!user_ids ? JSON.parse((user_ids as unknown as string)) : undefined;
            const parsedDateRange = !!date_range ? JSON.parse(date_range as unknown as string) : undefined;
            
            try {
                const sessionHistories = await getWorkspaceSessionHistories( workspace_id, parsedUserIds, parsedDateRange )
                res.status(200).json(sessionHistories)
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }
        }
    )

    // POST

    // Move task to todo
    router.post(
        "/add-to-todo/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IAddTaskToTodoRequest, res : Response ) => {

            const { task_id } = req.params;
            const { display_order } = req.body
            const { user_id } = req.user

            try {
                await addTaskToTodo( task_id, user_id, display_order )
                res.status(200).json({ message : "Task added to todo" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Finish task todo session
    router.post(
        "/finish-session/:workspace_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IFinishTaskTodoSessionRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { user_id } = req.user

            if ( !workspace_id ) {
                res.status(401).json({ message : "Workspace ID is required" })
            }

            try {
                await finishTaskTodoSession( workspace_id, user_id )
                res.status(200).json({ message : "Task todo session finished" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Start or stop task todo timer
    router.post(
        "/start-or-stop/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IStartOrStopTaskTodoTimerRequest, res : Response ) => {

            const { user_id } = req.user;
            const { task_id } = req.params;

            if ( !task_id ) {
                res.status(401).json({ message : "Task ID is required" })
            }

            try {   
                const timer = await startOrStopTaskTimer( user_id, task_id )
                if ( timer.start && timer.stop === null ) {
                    // Create the timeout timer to pause the the task timer when there is no active app updating the last_seen for 5 minutes
                    taskTodoTimerHeartbeatTimeoutManager.udpateTaskTodoTimerHeartbeatTimeout(
                        task_id,
                        user_id,
                        timer.last_seen!
                    )
                    res.status(200).json(timer)
                } else {
                    // Clear the heartbeat if paused
                    taskTodoTimerHeartbeatTimeoutManager.clearTaskTOdoTimerHeartbeatTimeout(
                        task_id,
                        user_id
                    )
                    res.status(200).json(timer)
                }
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Commit todo then remove
    router.post(
        "/commit/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : ICommitTaskTodoRequest, res : Response ) => {

            const { user_id } = req.user;
            const { task_id } = req.params;

            if ( !task_id ) {
                res.status(401).json({ message : "Task ID is required" })
            }

            try {
                await commitActiveTaskTodo( task_id, user_id );
                res.status(200).json({ message : "Task todo completed" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Mark todo as complete
    router.post(
        "/complete/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : ICompleteTaskTodoRequest, res : Response ) => {
            const { task_id } = req.params
            const { user_id } = req.user
            const { completed } = req.body

            try {
                await markActiveTodoAsComplete( task_id, user_id, completed )
                res.status(200).json({ message : "Task todo completed state updated" })
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Update task todo state
    router.patch(
        "/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IUpdateTaskTodoStateRequest, res : Response ) => {

            const { task_id } = req.params;
            const { display_order, active, current_work_time, work_time_goal } = req.body;
            const { user_id } = req.user;

            if ( !display_order && !active && !current_work_time && !work_time_goal ) {
                res.status(200).json({ message : "No fields to update" })
            }

            try {
                await updateTaskTodoState( task_id, user_id, { display_order, active, current_work_time, work_time_goal } )
                res.status(200).json({ message : "Task todo state updated" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Remove task from todo
    router.delete(
        "/:task_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IRemoveTaskFromTodoRequest, res : Response ) => {

            const { task_id } = req.params
            const { user_id } = req.user

            try {
                await updateTaskTodoState( task_id, user_id, { active : false } )
                res.status(200).json({ message : "Task removed from todo" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

}