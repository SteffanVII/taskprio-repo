import LoaderScreen from "@/components/others/LoaderScreen";
import { WebSocketProvider } from "@/components/others/websocket/WebsocketProvider";
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "@/lib/globals";
import StateManager_Project from "@/stateManagers/StateManager_Project";
import StateManager_Taskboard from "@/stateManagers/StateManager_Taskboard";
import StateManager_Workspace from "@/stateManagers/StateManager_Workspace";
import { useGlobalsStore } from "@/stores/globals";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: (context) => {
    if (!useGlobalsStore.getState().authenticated) {
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const userData = localStorage.getItem(USER_DATA_KEY)
      if (!authToken || !userData) {
        throw redirect({
          to: "/login"
        })
      } else {
        useGlobalsStore.setState({
          authenticated: true,
          user: JSON.parse(userData)
        })
        console.log(context.location.pathname)
        if (context.location.pathname === "/") {
          throw redirect({
            to: "/workspace"
          })
        }
      }
    }
  },
  component: AuthenticatedLayout
})

function AuthenticatedLayout() {

  return (
    <WebSocketProvider>
      <StateManager_Workspace>
        <StateManager_Project>
          <StateManager_Taskboard>
            <Outlet />
          </StateManager_Taskboard>
        </StateManager_Project>
      </StateManager_Workspace>
    </WebSocketProvider>
  )
}