import { WebSocketContext } from "@/components/others/websocket/WebsocketHandler"
import { resetGlobalsStore } from "@/stores/globals"
import Cookies from "js-cookie"
import { useContext } from "react"
import { useNavigate } from "react-router"

export const useLogout = () => {

    const navigate = useNavigate()

    const {
        connected,
        closeWebSocketConnection
    } = useContext(WebSocketContext)

    return () => {
        console.log("logging out");
        if ( connected ) closeWebSocketConnection()
        localStorage.removeItem("access_token")
        Cookies.remove("access_token")
        resetGlobalsStore()
        navigate("/login")
    }

}