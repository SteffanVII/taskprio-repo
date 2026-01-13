import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { updateWorkspaceStore, useWorkspaceStore_selectedWorkspace, useWorkspaceStore_workspaces } from "@/stores/workspace"
import { TWebSocketMessage, TWorkspaceMemberDeactivatedWebSocketMessage, TWorkspaceMemberReactivatedWebSocketMessage } from "@repo/taskprio-types/src"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { QueryKeys } from "@/services/enum"
import { updateProjectStore } from "@/stores/project"
import { updateTaskboardStore } from "@/stores/taskboard"


export const useWorkspaceEventHandlers = () => {

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const user = useGlobalsStore_user()
    const workspaces = useWorkspaceStore_workspaces()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const workspaceMemberDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_WORKSPACES.split ]
        })

        if (message.message.member_id === user?.user_id) {
            if (selectedWorkspace?.workspace_id === message.message.workspace_id) {
                toast.warning( `You have been deactivated from the workspace ${selectedWorkspace?.workspace_name}` )
                queryClient.setQueryData(
                    [ ...QueryKeys.GET_USER_WORKSPACES.split ],
                    (oldData: any) => {
                        return oldData.filter((workspace: any) => workspace.workspace_id !== message.message.workspace_id)
                    }
                )
                updateWorkspaceStore({
                    selectedWorkspace : null
                })
                updateProjectStore({
                    projects : undefined,
                    selectedProject : null
                })
                updateTaskboardStore({
                    taskboards : undefined,
                    selectedTaskboard : null
                })
                updateGlobalsStore({
                    selectedTask : null
                })
                navigate(`/p/w`)
            }
        }

    }, [
        workspaces,
        selectedWorkspace
    ])

    const workspaceMemberReactivatedWebSocketMessageHandler = useCallback((_message: TWebSocketMessage<TWorkspaceMemberReactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_WORKSPACES.split ]
        })
    }, [])

    return useMemo(() => ({
        workspaceMemberDeactivatedWebSocketMessageHandler,
        workspaceMemberReactivatedWebSocketMessageHandler
    }), [
        workspaceMemberDeactivatedWebSocketMessageHandler,
        workspaceMemberReactivatedWebSocketMessageHandler
    ])

}