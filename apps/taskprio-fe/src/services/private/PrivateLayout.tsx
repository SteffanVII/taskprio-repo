import { WebSocketProvider } from "@/components/others/websocket/WebsocketHandler";
import { Outlet } from "react-router"


export const PrivateLayout = () => {

    return  (
        <WebSocketProvider>
            <Outlet/>
        </WebSocketProvider>
    )

}

export default PrivateLayout;