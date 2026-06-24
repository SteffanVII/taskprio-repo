import { EWebsocketConnectionState, WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { useLogoutRequest } from "@/services/authentication"
import { useQueryClient } from "@tanstack/react-query"
import Cookies from "js-cookie"
import { useContext } from "react"
import { useGlobalsStore } from "@/stores/globals"
import { useTaskboardDragStore } from "@/stores/taskboardDrag"
import { useSessionHistoryTabStore } from "@/stores/sessionHistoryTab"
import { useTaskTodoPageStore } from "@/stores/taskTodoPage"
import { useDialogsStore } from "@/stores/dialogs"
import { useWorkspaceStore } from "@/stores/workspace"
import { useProjectStore } from "@/stores/project"
import { useTaskboardStore } from "@/stores/taskboard"
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "../globals"
import { useNavigate } from "@tanstack/react-router"

export type TUseLogout = {
  logout: () => Promise<void>
  isLogoutPending: boolean
  isLogoutError: boolean
}

export const useLogout = (): TUseLogout => {

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const resetGlobalsStore = useGlobalsStore(state => state.resetStore)
  const resetTaskboardDragStore = useTaskboardDragStore(state => state.resetStore)
  const resetSessionHistoryTabStore = useSessionHistoryTabStore(state => state.resetStore)
  const resetTaskTodoPageStore = useTaskTodoPageStore(state => state.resetStore)
  const resetDialogsStore = useDialogsStore(state => state.resetDialogsStore)
  const resetWorkspaceStore = useWorkspaceStore(state => state.resetStore)
  const resetProjectStore = useProjectStore(state => state.resetStore)
  const resetTaskboardStore = useTaskboardStore(state => state.resetStore)

  const {
    connectionState,
    closeWebSocketConnection
  } = useContext(WebSocketContext)

  const {
    mutateAsync: logout,
    isPending: isLogoutPending,
    isError: isLogoutError
  } = useLogoutRequest({
    onSuccess: () => {
      if (connectionState === EWebsocketConnectionState.OPEN) closeWebSocketConnection()
      Cookies.remove("access_token")
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_DATA_KEY)
      localStorage.removeItem(import.meta.env.VITE_LAST_WORKSPACE_VISTED_COOKIE_NAME)
      localStorage.removeItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME)
      localStorage.removeItem(import.meta.env.VITE_IGNORE_TODO_SESSION_IS_ACTIVE_WARNING_LOCAL_STORAGE_NAME)
      navigate({
        to: "/login"
      })
      setTimeout(() => {
        resetGlobalsStore()
        resetTaskboardDragStore()
        resetSessionHistoryTabStore()
        resetTaskTodoPageStore()
        resetDialogsStore()
        resetWorkspaceStore()
        resetProjectStore()
        resetTaskboardStore()
        queryClient.clear()
      }, 300)
    }
  })

  return {
    logout: async () => {
      console.log("logging out");
      await logout()
    },
    isLogoutPending,
    isLogoutError
  }

}