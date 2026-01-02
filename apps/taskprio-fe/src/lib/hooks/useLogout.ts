import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { useLogoutRequest } from "@/services/authentication"
import { resetDialogsStore } from "@/stores/dialogs"
import { resetGlobalsStore, updateGlobalsStore } from "@/stores/globals"
import { resetSessionHistoryTabStore } from "@/stores/sessionHistoryTab"
import { resetTaskboardDragStore } from "@/stores/taskboardDrag"
import { resetTaskTodoPageStore } from "@/stores/taskTodoPage"
import { useQueryClient } from "@tanstack/react-query"
import Cookies from "js-cookie"
import { useContext, useLayoutEffect } from "react"
import { useNavigate } from "react-router"

export type TUseLogout = {
    logout : () => Promise<void>
    isLogoutPending : boolean
    isLogoutError : boolean
}

export const useLogout = () : TUseLogout => {

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const {
        connected,
        closeWebSocketConnection
    } = useContext(WebSocketContext)

    const {
        mutateAsync : logout,
        isPending : isLogoutPending,
        isError : isLogoutError
    } = useLogoutRequest({
        onSuccess : () => {
            if ( connected ) closeWebSocketConnection()
            Cookies.remove("access_token")
            localStorage.removeItem( import.meta.env.VITE_LAST_WORKSPACE_VISTED_COOKIE_NAME )
            localStorage.removeItem( import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME )
            localStorage.removeItem( import.meta.env.VITE_IGNORE_TODO_SESSION_IS_ACTIVE_WARNING_LOCAL_STORAGE_NAME )
            navigate("/login")
            setTimeout(() => {
                resetGlobalsStore()
                resetTaskboardDragStore()
                resetSessionHistoryTabStore()
                resetTaskTodoPageStore()
                resetDialogsStore()
                queryClient.clear()
            }, 300)
        }
    })

    useLayoutEffect(() => {
        updateGlobalsStore({
            logoutIsPending : isLogoutPending
        })
    }, [isLogoutPending])

    return {
        logout : async () => {
            console.log("logging out");
            await logout()
        },
        isLogoutPending,
        isLogoutError
    }

}