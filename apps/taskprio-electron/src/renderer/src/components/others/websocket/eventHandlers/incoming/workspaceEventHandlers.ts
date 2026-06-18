import { useGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { useWorkspaceStore, useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { TWebSocketMessage, TWorkspaceMemberDeactivatedWebSocketMessage, TWorkspaceMemberReactivatedWebSocketMessage } from "@repo/taskprio-types"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { QueryKeys } from "@/services/enum"
import useLatest from "@/lib/hooks/useLates"
import { useProjectStore } from "@/stores/project"
import { useTaskboardStore } from "@/stores/taskboard"
import { useResetGetUserProjectsByWorkspace } from "@/services/private/project/query"
import { useResetProjectTaskboardsQuery } from "@/services/private/taskboard/query"


export const useWorkspaceEventHandlers = () => {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const userState = useGlobalsStore_user()
  const selectedWorkspaceState = useWorkspaceStore_selectedWorkspace()
  const setSelectedWorkspace = useWorkspaceStore(state => state.setSelectedWorkspace)
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const resetGetUserProjectsByWorkspace = useResetGetUserProjectsByWorkspace()
  const resetProjectTaskboardsData = useResetProjectTaskboardsQuery()

  const user = useLatest(userState)
  const selectedWorkspace = useLatest(selectedWorkspaceState)

  const workspaceMemberDeactivatedWebSocketMessageHandler = async (message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

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
        setSelectedWorkspace(null)
        setSelectedProject(null)
        setSelectedTaskboard(null)
        setSelectedTask(null)
        await Promise.all([
          resetGetUserProjectsByWorkspace(),
          resetProjectTaskboardsData()
        ])
        navigate({
          to: "/workspace"
        })
        // navigate(`/p/w`)
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