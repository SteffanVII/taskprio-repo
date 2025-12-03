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
            case EWebSocketEventType.TASK_UPDATED:
                taskEventHandlers.taskUpdateWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASKBOARD_DEACTIVATED:
                taskboardEventHandlers.taskboardDeactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASKBOARD_DROPPED:
                taskboardEventHandlers.taskboardDroppedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.TASKBOARD_REACTIVATED:
                taskboardEventHandlers.taskboardReactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_DEACTIVATED:
                projectEventHandlers.projectDeactivatedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_DROPPED:
                projectEventHandlers.projectDroppedWebSocketMessageHandler( message )
                break;
            case EWebSocketEventType.PROJECT_REACTIVATED:
                projectEventHandlers.projectReactivatedWebSocketMessageHandler( message )
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