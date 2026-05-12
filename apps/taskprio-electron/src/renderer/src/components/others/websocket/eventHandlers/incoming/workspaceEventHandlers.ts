import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { updateWorkspaceStore, useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { TWebSocketMessage, TWorkspaceMemberDeactivatedWebSocketMessage, TWorkspaceMemberReactivatedWebSocketMessage } from "@repo/taskprio-types"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { QueryKeys } from "@/services/enum"
import { updateProjectStore } from "@/stores/project"
import { updateTaskboardStore } from "@/stores/taskboard"
import useLatest from "@/lib/hooks/useLates"


export const useWorkspaceEventHandlers = () => {

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const userState = useGlobalsStore_user()
    const selectedWorkspaceState = useWorkspaceStore_selectedWorkspace()

    const user = useLatest(userState)
    const selectedWorkspace = useLatest(selectedWorkspaceState)

    const workspaceMemberDeactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_WORKSPACES.split]
        })

        if (message.message.member_id === user.current?.user_id) {
            if (selectedWorkspace.current?.workspace_id === message.message.workspace_id) {
                toast.warning(`You have been deactivated from the workspace ${selectedWorkspace.current?.workspace_name}`)
                queryClient.setQueryData(
                    [...QueryKeys.GET_USER_WORKSPACES.split],
                    (oldData: any) => {
                        return oldData.filter((workspace: any) => workspace.workspace_id !== message.message.workspace_id)
                    }
                )
                updateWorkspaceStore({
                    selectedWorkspace: null
                })
                updateProjectStore({
                    projects: undefined,
                    selectedProject: null
                })
                updateTaskboardStore({
                    taskboards: undefined,
                    selectedTaskboard: null
                })
                updateGlobalsStore({
                    selectedTask: null
                })
                navigate(`/p/w`)
            }
        }

    }

    const workspaceMemberReactivatedWebSocketMessageHandler = (_message: TWebSocketMessage<TWorkspaceMemberReactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_WORKSPACES.split]
        })
    }

    return {
        workspaceMemberDeactivatedWebSocketMessageHandler,
        workspaceMemberReactivatedWebSocketMessageHandler
    }

}