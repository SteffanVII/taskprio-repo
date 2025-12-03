import { EWebSocketEventType, TTaskboardDeactivatedWebSocketMessage, TTaskboardDroppedWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types"
import { wsConnectionsManagerSimple } from "../../app.js"
import { getProjectMembers } from "../../database/queries/project/query.js";
import { getWorkspaceIdFromProjectId } from "../../database/queries/workspace/query.js";


export const taskboardDroppedEventSender = async (
    project_id : string,
    message : Pick<TWebSocketMessage<TTaskboardDroppedWebSocketMessage>, "data">,
) : Promise<void> => {
    const workspaceId = await getWorkspaceIdFromProjectId(project_id);
    const projectMembers = await getProjectMembers(project_id);
    wsConnectionsManagerSimple.sendMessage(
        {
            type : EWebSocketEventType.TASKBOARD_DROPPED,
            ...message
        },
        workspaceId,
        projectMembers.map((member) => member.user_id),
    )

}

export const taskboardDeactivatedEventSender = (
    workspace_id : string, message : Pick<TWebSocketMessage<TTaskboardDeactivatedWebSocketMessage>, "data">
) => {
    wsConnectionsManagerSimple.sendMessage(
        {
            type : EWebSocketEventType.TASKBOARD_DEACTIVATED,
            ...message
        },
        workspace_id
    )
}