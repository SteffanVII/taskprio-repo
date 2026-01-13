import { useGlobalsStore_user } from "@/stores/globals"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { TWebSocketMessage, TWorkspaceMemberDeactivatedWebSocketMessage, TWorkspaceMemberReactivatedWebSocketMessage } from "@repo/taskprio-types/src"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { QueryKeys } from "@/services/enum"


export const useWorkspaceEventHandlers = () => {

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const user = useGlobalsStore_user()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const workspaceMemberDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

        queryClient.invalidateQueries({
            queryKey : [ ...QueryKeys.GET_USER_WORKSPACES.split ]
        })

        console.log(message.message.member_id === user?.user_id);
        console.log(selectedWorkspace?.workspace_id === message.message.workspace_id)
        if (message.message.member_id === user?.user_id) {
            if (selectedWorkspace?.workspace_id === message.message.workspace_id) {
                toast.warning( `You have been deactivated from the workspace ${selectedWorkspace?.workspace_name}` )
                navigate(`/p/w`)
            }
        }

    }, [selectedWorkspace])

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