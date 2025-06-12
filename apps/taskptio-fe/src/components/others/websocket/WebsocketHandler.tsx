import { EWebSocketEventType } from "@/services/private/websocket/enums"
import { TWebSocketMessage, TWebSocketMessagePathChange } from "@/services/private/websocket/types"
import { useGlobalsStore } from "@/stores/globals"
import { createContext, useLayoutEffect, useRef, useState } from "react"

type TWebSocketContext = {
    connected : boolean,
    socket : WebSocket | null,
    closeWebSocketConnection : () => void,
    pathChangeMethods : {
        updateWorkspacePath : ( workspace_id : string ) => void,
        updateProjectPath : ( project_id : string ) => void,
        updateBoardPath : ( board_id : string ) => void
    }
}

export const WebSocketContext = createContext<TWebSocketContext>({
    connected : false,
    socket : null,
    closeWebSocketConnection : () => {},
    pathChangeMethods : {
        updateWorkspacePath : () => {},
        updateProjectPath : () => {},
        updateBoardPath : () => {}
    }
})

type TWebSocketProviderProps = {
    children : React.ReactNode
}

export const WebSocketProvider = ({ children } : TWebSocketProviderProps) => {

    const {
        authenticated,
        selectedWorkspace,
        selectedProject,
        selectedTaskboard
    } = useGlobalsStore()

    const [ connected, setConnected ] = useState(false)
    const socket = useRef<WebSocket | null>(null)

    const updateWorkspacePath = ( workspace_id : string ) => {
        const message : TWebSocketMessage<TWebSocketMessagePathChange> = {
            type : EWebSocketEventType.PATH_CHANGE,
            data : {
                previous_path : {
                    workspace_id : selectedWorkspace?.workspace_id,
                    project_id : selectedProject?.project_id,
                    board_id : selectedTaskboard?.task_board_id
                },
                workspace_id : workspace_id
            }
        }
        sendWebSocketMessage(message)
    }

    const updateProjectPath = ( project_id : string ) => {
        const message : TWebSocketMessage<TWebSocketMessagePathChange> = {
            type : EWebSocketEventType.PATH_CHANGE,
            data : {
                previous_path : {
                    workspace_id : selectedWorkspace?.workspace_id,
                    project_id : selectedProject?.project_id,
                    board_id : selectedTaskboard?.task_board_id
                },
                workspace_id : selectedWorkspace?.workspace_id!,
                project_id : project_id
            }
        }
        sendWebSocketMessage(message)
    }

    const updateBoardPath = ( board_id : string ) => {
        const message : TWebSocketMessage<TWebSocketMessagePathChange> = {
            type : EWebSocketEventType.PATH_CHANGE,
            data : {
                previous_path : {
                    workspace_id : selectedWorkspace?.workspace_id,
                    project_id : selectedProject?.project_id,
                    board_id : selectedTaskboard?.task_board_id
                },
                workspace_id : selectedWorkspace?.workspace_id!,
                project_id : selectedProject?.project_id!,
                board_id : board_id
            }
        }
        sendWebSocketMessage(message)
    }

    const sendWebSocketMessage = ( message : TWebSocketMessage ) => {
        if ( !socket.current ) return
        socket.current.send(JSON.stringify(message))
    }

    const closeWebSocketConnection = () => {
        if ( !socket.current ) return
        socket.current.close()
        socket.current = null
        setConnected(false)
    }

    useLayoutEffect(() => {
        if ( socket.current ) return
        if ( !authenticated ) return
        socket.current = new WebSocket(
            `${import.meta.env.VITE_TASKPRIO_WSS_URL}`
        )
        socket.current.onopen = () => {
            setConnected(true)
        }
        socket.current.onclose = () => {
            setConnected(false)
        }
    }, [ authenticated ] )

    return (
        <WebSocketContext.Provider
            value={{
                connected,
                socket : socket.current,
                closeWebSocketConnection,
                pathChangeMethods : {
                    updateWorkspacePath,
                    updateProjectPath,
                    updateBoardPath
                }
            }}
        >
            { children }
        </WebSocketContext.Provider>
    )

}