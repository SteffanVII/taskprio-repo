import { WebSocketProvider } from "@/components/others/websocket/WebsocketProvider";
import StateManager_Project from "@/stateManagers/StateManager_Project";
import StateManager_Taskboard from "@/stateManagers/StateManager_Taskboard";
import StateManager_TaskTodoPage from "@/stateManagers/StateManager_TaskTodoPage";
import StateManager_Workspace from "@/stateManagers/StateManager_Workspace";
import { Outlet } from "react-router"


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

export default PrivateLayout;