import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { useLogoutRequest } from "@/services/authentication"
import { resetDialogsStore } from "@/stores/dialogs"
import { resetGlobalsStore, updateGlobalsStore } from "@/stores/globals"
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
            resetGlobalsStore()
            resetTaskboardDragStore()
            resetTaskTodoPageStore()
            resetDialogsStore()
            navigate("/login")
            queryClient.clear()
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