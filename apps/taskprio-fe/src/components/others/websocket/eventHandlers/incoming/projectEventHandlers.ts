import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore } from "@/stores/globals";
import { TProjectDeactivatedSocketMessage, TProjectDroppedSocketMessage, TProjectReactivatedSocketMessage, TWebSocketMessage } from "@repo/taskprio-types/src";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";

const useProjectEventHandlers = () => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    
    const {
        workspace_id,
        project_id
    } = useParams()

    const projectDeactivatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectDeactivatedSocketMessage> ) => {
        if ( message.data.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
            if ( project_id === message.data.project_id ) {
                updateGlobalsStore({
                    selectedProject : null,
                    selectedTaskboard : null,
                    selectedTask : null,
                    noTaskboards : false
                })
                navigate(`/p/w/${workspace_id}/d`)
            }
        } 
    }, [
        workspace_id,
        project_id
    ])
    
    const projectDroppedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectDroppedSocketMessage> ) => {
        if ( message.data.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
            if ( project_id === message.data.project_id ) {
                updateGlobalsStore({
                    selectedProject : null,
                    selectedTaskboard : null,
                    selectedTask : null,
                    noTaskboards : false
                })
                navigate(`/p/w/${workspace_id}/d`)
            }
        } 
    }, [
        workspace_id,
        project_id
    ])

    const projectReactivatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectReactivatedSocketMessage> ) => {
        if ( message.data.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
        }
    }, [workspace_id])

    return {
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler
    }

}

export default useProjectEventHandlers;