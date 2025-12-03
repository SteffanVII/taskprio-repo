import { Response, Router } from "express";
import { ICreateTaskboardRequest, IDeactivateTaskboardRequest, IDropTaskboardRequest, IGetProjectInactiveTaskboardsRequest, IGetProjectTaskboardListRequest, IGetTaskboardTrashTasksRequest, IReactivateTaskboardRequest } from "./interfaces.js";
import { getProjectInactiveTaskboardList, getProjectTaskboardList } from "../../database/queries/taskboard/query.js";
import { getProjectMember, getProjectMembers, getProjectMembersByTheirUserId } from "../../database/queries/project/query.js";
import { verifyProjectMemberMiddleware, verifyProjectOwnerOrAdminMiddleware } from "../../middlewares/authentication.js";
import { getTaskboardTrashTasks } from "../../database/queries/task/query.js";
import { EProjectRole, EWebSocketEventType, TTaskboardDeactivatedWebSocketMessage, TTaskboardDroppedWebSocketMessage, TTaskboardReactivatedWebSocketMessage } from "@repo/taskprio-types";
import { createTaskboard, deactivateTaskboard, dropTaskboard, reactivateTaskboard } from "../../database/queries/taskboard/mutation.js";
import { getWorkspaceIdFromProjectId } from "../../database/queries/workspace/query.js";
import { taskboardDroppedEventSender } from "../../websocket/eventSenders/taskboardEventSenders.js";
import { wsConnectionsManagerSimple } from "../../app.js";

export const registerTaskboardRoutes = ( router : Router ) => {

    // GET

    // Get taskboards
    router.get(
        `/s`,
        async ( req : IGetProjectTaskboardListRequest, res : Response ) => {
            const { project_id } = req.query;
            const { user_id } = req.user;

            const projectMember = await getProjectMember(project_id, user_id);

            if ( !projectMember ) {
                res.status(403).json({
                    message : "You are not a member of this project"
                })
            }

            const taskboardList = await getProjectTaskboardList(project_id);

            res.status(200).json(taskboardList);
        }
    )

    // Get taskboard trash tasks
    router.get(
        `/trash-tasks/:taskboard_id`,
        verifyProjectMemberMiddleware,
        async ( req : IGetTaskboardTrashTasksRequest, res : Response ) => {

            const { taskboard_id } = req.params

            try {
                const trash = await getTaskboardTrashTasks(taskboard_id)
                res.status(200).json(trash)
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }

        }
    )

    // Get project deactivated taskboards
    router.get(
        `/inactive`,
        verifyProjectMemberMiddleware,
        async ( req : IGetProjectInactiveTaskboardsRequest, res : Response ) => {
            const { project_id } = req.query;
            try {
                const taskboardList = await getProjectInactiveTaskboardList(project_id);
                res.status(200).json(taskboardList);
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }
        }
    )

    // POST

    // Create taskboard
    router.post(
        `/create`,
        verifyProjectMemberMiddleware,
        async ( req : ICreateTaskboardRequest, res : Response ) => {
            const { project_id, taskboard_name } = req.body;
            const projectRole = req.projectRole;

            try {
                if ( projectRole === EProjectRole.ADMIN || projectRole === EProjectRole.OWNER ) {
                    const createdTaskboard = await createTaskboard(project_id, taskboard_name)
                    res.status(200).json(createdTaskboard)
                } else {
                    res.status(403).json({message : "You are not authorized to create a taskboard"})
                }
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }
        }
    )

    // Deactivate Taskboard
    router.post(
        `/deactivate`,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IDeactivateTaskboardRequest, res : Response ) => {
            const { taskboard_id, project_id } = req.body;

            try {
                await deactivateTaskboard( project_id, taskboard_id)
                const workspaceId = await getWorkspaceIdFromProjectId(project_id)
                const projectMembers = await getProjectMembers(project_id);
                if ( workspaceId && projectMembers.length > 0 ) {
                    const wsMessage : TTaskboardDeactivatedWebSocketMessage = {
                        taskboard_id,
                        workspace_id : workspaceId
                    }
                    wsConnectionsManagerSimple.sendMessage(
                        {
                            type : EWebSocketEventType.TASKBOARD_DEACTIVATED,
                            data : wsMessage
                        },
                        workspaceId,
                        projectMembers.map((member) => member.user_id)
                    )
                }
                res.status(200).json({message : "Taskboard deactivated successfully"})
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }
        }
    )

    router.post(
        `/reactivate`,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IReactivateTaskboardRequest, res : Response ) => {
            const { taskboard_id, project_id } = req.body;
            try {
                await reactivateTaskboard(taskboard_id, project_id)
                const workspaceId = await getWorkspaceIdFromProjectId(project_id)
                const projectMembers = await getProjectMembers(project_id);
                if ( workspaceId && projectMembers.length > 0 ) {
                    const wsMessage : TTaskboardReactivatedWebSocketMessage = {
                        project_id
                    }
                    wsConnectionsManagerSimple.sendMessage(
                        {
                            type : EWebSocketEventType.TASKBOARD_REACTIVATED,
                            data : wsMessage
                        },
                        workspaceId,
                        projectMembers.map((member) => member.user_id)
                        
                    )
                }
                res.status(200).json({message : "Taskboard reactivated successfully"})
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }
        }
    )

    // DELETE

    // Drop taskboard
    router.delete(
        `/drop`,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IDropTaskboardRequest, res : Response ) => {
            const { taskboard_id, project_id, taskboard_name_confirmation } = req.query
            try {
                await dropTaskboard(project_id, taskboard_id, taskboard_name_confirmation)
                const workspaceId = await getWorkspaceIdFromProjectId(project_id);
                const projectMembers = await getProjectMembers(project_id);
                const wsMessage : TTaskboardDroppedWebSocketMessage = {
                    taskboard_id,
                    workspace_id : workspaceId
                }
                wsConnectionsManagerSimple.sendMessage(
                    {
                        type : EWebSocketEventType.TASKBOARD_DROPPED,
                        data : wsMessage
                    },
                    workspaceId,
                    projectMembers.map((member) => member.user_id)
                )
                res.status(200).json({message : "Taskboard deleted successfully"})
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }
        }
    )

}