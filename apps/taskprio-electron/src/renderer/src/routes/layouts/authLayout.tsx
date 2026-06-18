import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "@tanstack/react-router";
import { useAuthenticate } from "@/services/authentication";
import { updateGlobalsStore, useGlobalsStore_authenticated } from "@/stores/globals";
import { WebSocketProvider } from "@/components/others/websocket/WebsocketProvider";
import StateManager_Electron from "@/stateManagers/StateManager_Electron";
import LoaderScreen from "@/components/others/LoaderScreen";

const AuthLayout = () => {

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const authenticated = useGlobalsStore_authenticated()

  // const isElectron = useElectronStore_isElectron()
  // const taskTodoPageUIMode = useTaskTodoPageStore_uIMode()

  const onAuthenticateSuccess = () => {
    updateGlobalsStore({
      authenticated: true
    })
    if (searchParams.get("invite_token")) return
    if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
      navigate("/p/w")
    }
  }

  const onAuthenticateError = () => {
    updateGlobalsStore({
      authenticated: false
    })
    if (location.pathname === "/accept") return
    navigate("/login")
  }

  const {
    mutateAsync: authenticate,
    isPending: authenticateIsPending,
  } = useAuthenticate(
    onAuthenticateSuccess,
    onAuthenticateError
  )

  useLayoutEffect(() => {
    if (!authenticated && !authenticateIsPending) authenticate()
  }, [authenticated, authenticateIsPending])

  useLayoutEffect(() => {
    updateGlobalsStore({
      authenticateIsPending,
    })
  }, [
    authenticateIsPending,
  ])

  return (
    <WebSocketProvider>
      <StateManager_Electron>
        {/* {
          (isElectron && (taskTodoPageUIMode !== ETaskTodoPageUIMode.OVERLAY && taskTodoPageUIMode !== ETaskTodoPageUIMode.WIDGET)) &&
          <ElectronCustomTitlebar />
        } */}
        <LoaderScreen
          render={
            <Outlet />
          }
        />
      </StateManager_Electron>
    </WebSocketProvider>
  )

}

export default AuthLayout;