import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore } from "@/stores/globals";
import { TTaskboardDeactivatedWebSocketMessage, TTaskboardDroppedWebSocketMessage, TTaskboardReactivatedWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types/src";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";

export const useTaskboardEventHandlers = () => {

    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const {
        workspace_id,
        project_id,
        task_board_id
    } = useParams()


    const taskboardDeactivatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TTaskboardDeactivatedWebSocketMessage> ) => {
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_PROJECT_TASKBOARDS.split ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.data.workspace_id ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, message.data.workspace_id ]
        })
        if ( task_board_id && message.data.taskboard_id ) {
            navigate(`/p/w/${workspace_id}/d/${project_id}/t`)
            updateGlobalsStore({
                selectedTask : null
            })
        }
    }, [
        workspace_id,
        project_id,
        task_board_id
    ])

    const taskboardDroppedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TTaskboardDroppedWebSocketMessage> ) => {
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_PROJECT_TASKBOARDS.split ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.data.workspace_id ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, message.data.workspace_id ]
        })
        if ( task_board_id && message.data.taskboard_id ) {
            navigate(`/p/w/${workspace_id}/d/${project_id}/t`)
            updateGlobalsStore({
                selectedTask : null
            })
        }
    }, [
        workspace_id,
        project_id,
        task_board_id
    ])

    const taskboardReactivatedWebSocketMessageHandler = useCallback(( _message : TWebSocketMessage<TTaskboardReactivatedWebSocketMessage> ) => {
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_PROJECT_TASKBOARDS.split ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split ]
        })
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split ]
        })
    }, [
        workspace_id,
        project_id,
        task_board_id
    ])

    return {
        taskboardDeactivatedWebSocketMessageHandler,
        taskboardDroppedWebSocketMessageHandler,
        taskboardReactivatedWebSocketMessageHandler
    }

}