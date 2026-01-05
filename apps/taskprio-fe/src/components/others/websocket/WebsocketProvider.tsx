import { useGlobalsStore_authenticated, useGlobalsStore_selectedProject, useGlobalsStore_selectedTaskboard, useGlobalsStore_selectedWorkspace } from "@/stores/globals"
import { EWebsocketClientEventType, TWebSocketJoinProjectChannelMessage, TWebSocketJoinTaskboardChannelMessage, TWebSocketJoinWorkspaceChannelMessage, TWebSocketLeaveProjectChannelMessage, TWebSocketLeaveTaskboardChannelMessage, TWebSocketLeaveWorkspaceChannelMessage, TWebSocketMessage } from "@repo/taskprio-types/src"
import { createContext, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useWebSocketEventHandlers } from "./eventHandlers/WebsocketEventHandlers"
import { useElectronStore_isElectron } from "@/stores/electron"
import { usePingServer } from "@/services/private/PrivateLayout"

type TWebSocketContext = {
    connected: boolean,
    socket: WebSocket | null,
    closeWebSocketConnection: () => void,
    sendWebSocketMessage: (message: TWebSocketMessage) => void,
    channelActions: {
        joinWorkspaceChannel: (workspace_id: string) => void,
        leaveWorkspaceChannel: (workspace_id: string) => void,
        joinProjectChannel: (project_id: string) => void,
        leaveProjectChannel: (project_id: string) => void,
        joinTaskboardChannel: (taskboard_id: string) => void,
        leaveTaskboardChannel: (taskboard_id: string) => void
    },
    initialConnection: boolean,
}

export const WebSocketContext = createContext<TWebSocketContext>({
    connected: false,
    socket: null,
    sendWebSocketMessage: () => { },
    closeWebSocketConnection: () => { },
    channelActions: {
        joinWorkspaceChannel: () => { },
        leaveWorkspaceChannel: () => { },
        joinProjectChannel: () => { },
        leaveProjectChannel: () => { },
        joinTaskboardChannel: () => { },
        leaveTaskboardChannel: () => { }
    },
    initialConnection: true,
})

type TWebSocketProviderProps = {
    children: React.ReactNode
}

export const WebSocketProvider = ({ children }: TWebSocketProviderProps) => {

    const isElectron = useElectronStore_isElectron()
    const authenticated = useGlobalsStore_authenticated()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()

    const [connected, setConnected] = useState<boolean>(false)
    const initialConnection = useRef<boolean>(true)
    const socket = useRef<WebSocket | null>(null)
    const checkHealthTimerWorker = useRef<Worker>(null)

    const {
        mutateAsync: pingServerMutateAsync
    } = usePingServer()

    const joinWorkspaceChannel = (workspace_id: string) => {
        const message: TWebSocketMessage<TWebSocketJoinWorkspaceChannelMessage> = {
            type: EWebsocketClientEventType.JOIN_WORKSPACE_CHANNEL,
            message: {
                previous_workspace_id: selectedWorkspace?.workspace_id,
                workspace_id: workspace_id
            }
        }
        sendWebSocketMessage(message)
    }

    const leaveWorkspaceChannel = (workspace_id: string) => {
        const message: TWebSocketMessage<TWebSocketLeaveWorkspaceChannelMessage> = {
            type: EWebsocketClientEventType.LEAVE_WORKSPACE_CHANNEL,
            message: {
                workspace_id: workspace_id
            }
        }
        sendWebSocketMessage(message)
    }

    const joinProjectChannel = (project_id: string) => {
        const message: TWebSocketMessage<TWebSocketJoinProjectChannelMessage> = {
            type: EWebsocketClientEventType.JOIN_PROJECT_CHANNEL,
            message: {
                previous_project_id: selectedProject?.project_id,
                project_id: project_id
            }
        }
        sendWebSocketMessage(message)
    }

    const leaveProjectChannel = (project_id: string) => {
        const message: TWebSocketMessage<TWebSocketLeaveProjectChannelMessage> = {
            type: EWebsocketClientEventType.LEAVE_PROJECT_CHANNEL,
            message: {
                project_id: project_id
            }
        }
        sendWebSocketMessage(message)
    }

    const joinTaskboardChannel = (taskboard_id: string) => {
        const message: TWebSocketMessage<TWebSocketJoinTaskboardChannelMessage> = {
            type: EWebsocketClientEventType.JOIN_TASKBOARD_CHANNEL,
            message: {
                previous_taskboard_id: selectedTaskboard?.task_board_id,
                taskboard_id: taskboard_id
            }
        }
        sendWebSocketMessage(message)
    }

    const leaveTaskboardChannel = (taskboard_id: string) => {
        const message: TWebSocketMessage<TWebSocketLeaveTaskboardChannelMessage> = {
            type: EWebsocketClientEventType.LEAVE_TASKBOARD_CHANNEL,
            message: {
                taskboard_id: taskboard_id
            }
        }
        sendWebSocketMessage(message)
    }

    const sendWebSocketMessage = (message: TWebSocketMessage) => {
        if (!socket.current) return
        socket.current.send(JSON.stringify(message))
    }

    // Event Handlers
    const websocketEventHandlers = useWebSocketEventHandlers();

    const createCheckHealthTimer = () => {
        if (checkHealthTimerWorker.current === null) {
            checkHealthTimerWorker.current = new Worker(new URL("./checkHealthTimer.js", import.meta.url))
            checkHealthTimerWorker.current!.onmessage = (event: MessageEvent) => {
                const count = event.data
                if (count % 60 === 0 || count === 0) {
                    pingServerMutateAsync()
                    sendWebSocketMessage({
                        type: EWebsocketClientEventType.CHECK_HEALTH,
                        message: {
                            message: "ping"
                        }
                    })
                }
            }
        }
    }

    const clearCheckHealthTimer = () => {
        if (checkHealthTimerWorker.current) {
            checkHealthTimerWorker.current.onmessage = null
            checkHealthTimerWorker.current.terminate()
            checkHealthTimerWorker.current = null
        }
    }

    const closeWebSocketConnection = () => {
        if (!socket.current) return
        socket.current.close()
        socket.current = null
        setConnected(false)
        initialConnection.current = true
    }

    const createConnection = () => {
        if (!authenticated) return

        socket.current = null;
        socket.current = new WebSocket(
            `${import.meta.env.VITE_TASKPRIO_WSS_URL}?connection_type=${isElectron ? "electron" : "webapp"}&client_id=${localStorage.getItem(import.meta.env.VITE_CLIENT_ID_LOCAL_STORAGE_NAME)}`
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
            if (initialConnection.current === false) {
                setTimeout(() => {
                    createConnection()
                }, 3000)
            }
        }

        socket.current.onerror = () => {
            console.log("Connection error")
            clearCheckHealthTimer()
            setConnected(false)
            if (initialConnection.current === false) {
                setTimeout(() => {
                    createConnection()
                }, 3000)
            }
        }
    }

    useLayoutEffect(() => {
        if (socket.current) return
        createConnection()
        return () => {
            clearCheckHealthTimer()
            closeWebSocketConnection()
        }
    }, [authenticated, isElectron])

    // Attach the message handlers to the socket
    useLayoutEffect(() => {
        if (!connected) return
        if (!socket.current) return
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data) as TWebSocketMessage
            websocketEventHandlers(message)
        }
    }, [
        connected,
        selectedWorkspace,
        authenticated,
        websocketEventHandlers
    ])

    const contextValue = useMemo(() => ({
        connected,
        sendWebSocketMessage,
        closeWebSocketConnection,
        channelActions: {
            joinWorkspaceChannel,
            leaveWorkspaceChannel,
            joinProjectChannel,
            leaveProjectChannel,
            joinTaskboardChannel,
            leaveTaskboardChannel
        }
    }), [
        connected,
        sendWebSocketMessage,
        closeWebSocketConnection,
        joinWorkspaceChannel,
        leaveWorkspaceChannel,
        joinProjectChannel,
        leaveProjectChannel,
        joinTaskboardChannel,
        leaveTaskboardChannel
    ])

    return (
        <WebSocketContext.Provider
            value={{
                ...contextValue,
                initialConnection: initialConnection.current,
                socket: socket.current,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    )

}