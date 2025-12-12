import { WebSocketProvider } from "@/components/others/websocket/WebsocketProvider";
import StateManager_Project from "@/stateManagers/StateManager_Project";
import StateManager_Taskboard from "@/stateManagers/StateManager_Taskboard";
import StateManager_TaskTodoPage from "@/stateManagers/StateManager_TaskTodoPage";
import StateManager_Workspace from "@/stateManagers/StateManager_Workspace";
import { useMutation } from "@tanstack/react-query";
import { Outlet } from "react-router"
import { axiosInstance } from "../axios";


export const PrivateLayout = () => {

    return  (
        <WebSocketProvider>
            <StateManager_Workspace>
                <StateManager_TaskTodoPage>
                    <StateManager_Project>
                        <StateManager_Taskboard>
                            <Outlet/>
                        </StateManager_Taskboard>
                    </StateManager_Project>
                </StateManager_TaskTodoPage>
            </StateManager_Workspace>
        </WebSocketProvider>
    )

}

export const usePingServer = () => {
    return useMutation({
        mutationFn : async () => {
            const response = await axiosInstance.post(
                `/private/ping`
            )
            return response.data
        }
    })
}

export default PrivateLayout;