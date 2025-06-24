import { WebSocketContext } from "@/components/others/websocket/WebsocketHandler"
import { useLogoutRequest } from "@/services/authentication"
import { resetGlobalsStore } from "@/stores/globals"
import Cookies from "js-cookie"
import { useContext } from "react"
import { useNavigate } from "react-router"

export type TUseLogout = {
    logout : () => Promise<void>
    isLogoutPending : boolean
    isLogoutError : boolean
}

export const useLogout = () : TUseLogout => {

    const navigate = useNavigate()

    const {
        connected,
        closeWebSocketConnection
    } = useContext(WebSocketContext)

    const {
        mutateAsync : logout,
        isPending : isLogoutPending,
        isError : isLogoutError
    } = useLogoutRequest()

    return {
        logout : async () => {
            console.log("logging out");
            if ( connected ) closeWebSocketConnection()
            Cookies.remove("accessToken")
            await logout()
            resetGlobalsStore()
            navigate("/login")
        },
        isLogoutPending,
        isLogoutError
    }

}