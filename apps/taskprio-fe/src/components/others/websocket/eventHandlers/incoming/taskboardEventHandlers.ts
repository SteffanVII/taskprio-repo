import useLatest from "@/lib/hooks/useLates";
import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore } from "@/stores/globals";
import { TTaskboardDeactivatedWebSocketMessage, TTaskboardDroppedWebSocketMessage, TTaskboardReactivatedWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const useTaskboardEventHandlers = () => {

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const {
        workspace_id,
        project_id,
        task_board_id
    } = useParams()

    const workspaceId = useLatest(workspace_id)
    const projectId = useLatest(project_id)
    const taskboardId = useLatest(task_board_id)

    const taskboardDeactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TTaskboardDeactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.message.workspace_id]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, message.message.workspace_id]
        })
        if (taskboardId && message.message.taskboard_id) {
            navigate(`/p/w/${workspaceId.current}/d/${projectId.current}/t`)
            updateGlobalsStore({
                selectedTask: null
            })
        }
    }

    const taskboardDroppedWebSocketMessageHandler = (message: TWebSocketMessage<TTaskboardDroppedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.message.workspace_id]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, message.message.workspace_id]
        })
        if (taskboardId && message.message.taskboard_id) {
            navigate(`/p/w/${workspaceId.current}/d/${projectId.current}/t`)
            updateGlobalsStore({
                selectedTask: null
            })
        }
    }

    const taskboardReactivatedWebSocketMessageHandler = (_message: TWebSocketMessage<TTaskboardReactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split]
        })
    }

    return {
        taskboardDeactivatedWebSocketMessageHandler,
        taskboardDroppedWebSocketMessageHandler,
        taskboardReactivatedWebSocketMessageHandler
    }

}