import { useCallback } from "react"
import { useTaskboardEventHandlers } from "./incoming/taskboardEventHandlers"
import { useTaskEventHandlers } from "./incoming/taskEventHandlers"
import { EWebSocketEventType, TWebSocketMessage } from "@repo/taskprio-types/src"
import useProjectEventHandlers from "./incoming/projectEventHandlers"

export const useWebSocketEventHandlers = () => {

    const taskboardEventHandlers = useTaskboardEventHandlers()
    const taskEventHandlers = useTaskEventHandlers()
    const projectEventHandlers = useProjectEventHandlers()

    const eventHandlers = useCallback(( message : TWebSocketMessage ) => {

        switch ( message.type ) {
            // Task events
            case EWebSocketEventType.TASK_UPDATED:
                taskEventHandlers.taskUpdateWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASK_ASSIGNEE_ADDED:
                taskEventHandlers.taskAssigneeAddedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASK_ASSIGNEE_REMOVED:
                taskEventHandlers.taskAssigneeRemoveWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASK_TAG_ADDED:
                taskEventHandlers.taskTagAddedWebSocketMessageHandler( message )
                break;
                case EWebSocketEventType.TASK_TAG_REMOVED:
                    taskEventHandlers.taskTagRemovedWebSocketMessageHandler( message )
                break;
            // Taskboard events
            case EWebSocketEventType.TASKBOARD_DEACTIVATED:
                taskboardEventHandlers.taskboardDeactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASKBOARD_DROPPED:
                taskboardEventHandlers.taskboardDroppedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASKBOARD_REACTIVATED:
                taskboardEventHandlers.taskboardReactivatedWebSocketMessageHandler( message )
                break;
            // Project events
            case EWebSocketEventType.PROJECT_DEACTIVATED:
                projectEventHandlers.projectDeactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_DROPPED:
                projectEventHandlers.projectDroppedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_REACTIVATED:
                projectEventHandlers.projectReactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_CUSTOMIZATION_UPDATED:
                projectEventHandlers.projectCustomizationUpdatedwebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_CREATED:
                projectEventHandlers.projectCreatedWebSocketMessageHandler( message )
                break;
            
            default:
                break;
        }
    }, [
        taskboardEventHandlers,
        taskEventHandlers
    ])

    return eventHandlers

}