import { EWebSocketEventType, TTaskboardDeactivatedWebSocketMessage, TTaskboardDroppedWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types"
import { wsConnectionsManager } from "../../app.js"
import { getProjectMembers } from "../../database/queries/project/query.js";

export const taskboardDroppedEventSender = async (
    project_id : string,
    message : Pick<TWebSocketMessage<TTaskboardDroppedWebSocketMessage>, "message">,
) : Promise<void> => {
    const projectMembers = await getProjectMembers(project_id);
    wsConnectionsManager.broadcastToChannel(
        "project",
        project_id,
        {
            type : EWebSocketEventType.TASKBOARD_DROPPED,
            ...message
        },
        projectMembers.map((member) => member.user_id),
    )

}

export const taskboardDeactivatedEventSender = (
    project_id : string, message : Pick<TWebSocketMessage<TTaskboardDeactivatedWebSocketMessage>, "message">
) => {
    wsConnectionsManager.broadcastToChannel(
        "project",
        project_id,
        {
            type : EWebSocketEventType.TASKBOARD_DEACTIVATED,
            ...message
        }
    )
}