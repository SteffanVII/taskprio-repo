import { useGlobalsStore_authenticated, useGlobalsStore_selectedWorkspace } from "@/stores/globals"
import { EWebsocketClientEventType, TWebSocketChangePathMessageSimple, TWebSocketMessage } from "@repo/taskprio-types/src"
import { createContext, useLayoutEffect, useRef, useState } from "react"
import { useWebSocketEventHandlers } from "./eventHandlers/WebsocketEventHandlers"
import { useElectronStore_isElectron } from "@/stores/electron"
import { usePingServer } from "@/services/private/PrivateLayout"

type TWebSocketContext = {
    connected : boolean,
    socket : WebSocket | null,
    closeWebSocketConnection : () => void,
    sendWebSocketMessage : ( message : TWebSocketMessage ) => void,
    pathChangeMethods : {
        updateWorkspacePath : ( workspace_id : string ) => void,
        // updateProjectPath : ( project_id : string ) => void,
        // updateBoardPath : ( board_id : string ) => void
    },
    initialConnection : boolean,
    setInitialConnection : ( value : boolean ) => void
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
    },
    initialConnection : true,
    setInitialConnection : () => {}
})

type TWebSocketProviderProps = {
    children : React.ReactNode
}

export const WebSocketProvider = ({ children } : TWebSocketProviderProps) => {

    const isElectron = useElectronStore_isElectron()
    const authenticated = useGlobalsStore_authenticated()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const [ connected, setConnected ] = useState<boolean>(false)
    const initialConnection = useRef<boolean>(true)
    const socket = useRef<WebSocket | null>(null)
    const checkHealthTimerWorker = useRef<Worker>(null)

    const {
        mutateAsync : pingServerMutateAsync
    } = usePingServer()

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
        initialConnection.current = true
    }

    // Event Handlers
    const websocketEventHandlers = useWebSocketEventHandlers();

    const createCheckHealthTimer = () => {
        if ( checkHealthTimerWorker.current === null ) {
            checkHealthTimerWorker.current = new Worker(new URL("./checkHealthTimer.js", import.meta.url))
            checkHealthTimerWorker.current!.onmessage = ( event : MessageEvent ) => {
                const count = event.data
                if ( count % 60 === 0 || count === 0 ) {
                    pingServerMutateAsync()
                    sendWebSocketMessage({
                        type : EWebsocketClientEventType.CHECK_HEALTH,
                        data : {
                            message : "ping"
                        }
                    })
                }
            }
        }
    }

    const clearCheckHealthTimer = () => {
        if ( checkHealthTimerWorker.current ) {
            checkHealthTimerWorker.current.onmessage = null
            checkHealthTimerWorker.current.terminate()
            checkHealthTimerWorker.current = null
        }
    }

    const createConnection = () => {
        if ( !authenticated ) return

        socket.current = null;
        socket.current = new WebSocket(
            `${import.meta.env.VITE_TASKPRIO_WSS_URL}?connection_type=${isElectron ? "electron" : "webapp"}`
        )
        socket.current.onopen = () => {
            console.log("Connection open")
            createCheckHealthTimer()
            setConnected(true)
            initialConnection.current = false
        }

        socket.current.onclose = () => {
            console.log("Connection closed")
            clearCheckHealthTimer()
            setConnected(false)
            if ( initialConnection.current === false ) {
                createConnection()
            }
        }

        socket.current.onerror = () => {
            console.log("Connection error")
            clearCheckHealthTimer()
            setConnected(false)
            if ( initialConnection.current === false ) {
                createConnection()
            }
        }
    }

    useLayoutEffect(() => {
        if ( socket.current ) return
        createConnection()
        return () => {
            clearCheckHealthTimer()
        }
    }, [ authenticated, isElectron ] )

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
                initialConnection : initialConnection.current,
                setInitialConnection : ( value ) => {
                    initialConnection.current = value
                },
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