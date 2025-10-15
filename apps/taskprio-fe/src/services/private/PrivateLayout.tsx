import StateManager_TaskTodoPage from "@/components/others/taskTodo/StateManager_TaskTodoPage";
import { WebSocketProvider } from "@/components/others/websocket/WebsocketHandler";
import { Outlet } from "react-router"


export const PrivateLayout = () => {

    return  (
        <WebSocketProvider>
            <StateManager_TaskTodoPage>
                <Outlet/>
            </StateManager_TaskTodoPage>
        </WebSocketProvider>
    )

}

export default PrivateLayout;