import { useGlobalsStore_authenticated, useGlobalsStore_selectedWorkspace } from "@/stores/globals"
import { EWebsocketClientEventType, TWebSocketChangePathMessageSimple, TWebSocketMessage } from "@repo/taskprio-types/src"
import { createContext, useLayoutEffect, useRef, useState } from "react"
import { useWebSocketEventHandlers } from "./eventHandlers/WebsocketEventHandlers"

type TWebSocketContext = {
    connected : boolean,
    socket : WebSocket | null,
    closeWebSocketConnection : () => void,
    sendWebSocketMessage : ( message : TWebSocketMessage ) => void,
    pathChangeMethods : {
        updateWorkspacePath : ( workspace_id : string ) => void,
        // updateProjectPath : ( project_id : string ) => void,
        // updateBoardPath : ( board_id : string ) => void
    }
}

export const WebSocketContext = createContext<TWebSocketContext>({
    connected : false,
    socket : null,
    sendWebSocketMessage : () => {},
    closeWebSocketConnection : () => {},
    pathChangeMethods : {
        updateWorkspacePath : () => {},
        // updateProjectPath : () => {},
        // updateBoardPath : () => {}
    }
})

type TWebSocketProviderProps = {
    children : React.ReactNode
}

export const WebSocketProvider = ({ children } : TWebSocketProviderProps) => {

    const authenticated = useGlobalsStore_authenticated()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const [ connected, setConnected ] = useState(false)
    const socket = useRef<WebSocket | null>(null)

    const updateWorkspacePath = ( workspace_id : string ) => {
        const message : TWebSocketMessage<TWebSocketChangePathMessageSimple> = {
            type : EWebsocketClientEventType.PATH_CHANGE,
            data : {
                // The previous workspace id is the workspace id of the currently loaded workspace
                previous_workspace_id : selectedWorkspace?.workspace_id,
                workspace_id : workspace_id
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

    // Event Handlers
    const websocketEventHandlers = useWebSocketEventHandlers();

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

    // Attach the message handlers to the socket
    useLayoutEffect(() => {
        if ( !connected ) return
        if ( !socket.current ) return
        socket.current.onmessage = ( event ) => {
            const message = JSON.parse(event.data) as TWebSocketMessage
            websocketEventHandlers( message )
        }
    }, [ connected, selectedWorkspace, authenticated, websocketEventHandlers ])

    return (
        <WebSocketContext.Provider
            value={{
                connected,
                socket : socket.current,
                sendWebSocketMessage,
                closeWebSocketConnection,
                pathChangeMethods : {
                    updateWorkspacePath,
                }
            }}
        >
            { children }
        </WebSocketContext.Provider>
    )

}