import React, { createContext, useContext, useEffect } from "react"
import { io, Socket } from "socket.io-client"

type TStateManager_SocketContext = {
  socket : Socket,
  joinChannel : (workspaceId : string) => void
}

const StateManager_SocketContext = createContext<TStateManager_SocketContext>({
  socket : io(undefined, { autoConnect: false }),
  joinChannel : () => {}
})

const StateManager_Socket = (
  { children } : { children: React.ReactNode }
) => {

  const socket = io(import.meta.env.VITE_TASKPRIO_SERVICE_URL, {
    withCredentials: true,
    autoConnect: false
  })

  const joinChannel = (workspaceId : string) => {
    socket.emit("join-channel", workspaceId)
  }

  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <StateManager_SocketContext.Provider
      value={{
        socket,
        joinChannel
      }}
    >
      {children}
    </StateManager_SocketContext.Provider>
  )

}

export const useSocket = () => {
  return useContext(StateManager_SocketContext)
}

export default StateManager_Socket;