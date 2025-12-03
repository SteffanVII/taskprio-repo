import StateManager_Project from "@/components/others/project/StateManager_Project";
import StateManager_Taskboard from "@/components/others/taskboard/StateManager_Taskboard";
import StateManager_TaskTodoPage from "@/components/others/taskTodo/StateManager_TaskTodoPage";
import { WebSocketProvider } from "@/components/others/websocket/WebsocketProvider";
import StateManager_Workspace from "@/components/others/workspace/StateManager_Workspace";
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