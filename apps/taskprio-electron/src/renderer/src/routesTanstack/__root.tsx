import StateManager_Electron from "@/stateManagers/StateManager_Electron"
import { createRootRoute, Outlet } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <StateManager_Electron>
      <Outlet />
    </StateManager_Electron>
  )
}