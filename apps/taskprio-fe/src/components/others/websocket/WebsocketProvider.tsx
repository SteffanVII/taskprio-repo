import { useGlobalsStore_authenticated } from "@/stores/globals"
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard"
import { useProjectStore_selectedProject } from "@/stores/project"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { EWebsocketClientEventType, TWebSocketJoinProjectChannelMessage, TWebSocketJoinTaskboardChannelMessage, TWebSocketJoinWorkspaceChannelMessage, TWebSocketLeaveProjectChannelMessage, TWebSocketLeaveTaskboardChannelMessage, TWebSocketLeaveWorkspaceChannelMessage, TWebSocketMessage } from "@repo/taskprio-types"
import { createContext, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useWebSocketEventHandlers } from "./eventHandlers/WebsocketEventHandlers"
import { usePingServer } from "@/services/private/PrivateLayout"

export enum EWebsocketConnectionState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED
}

type TWebSocketContext = {
    connectionState: EWebsocketConnectionState,
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
    connectionState: EWebsocketConnectionState.CLOSED,
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

    const authenticated = useGlobalsStore_authenticated()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
    const selectedProject = useProjectStore_selectedProject()
    const selectedTaskboard = useTaskboardStore_selectedTaskboard()

    // const [connected, setConnected] = useState<boolean>(false)
    const initialConnection = useRef<boolean>(true)
    const socket = useRef<WebSocket | null>(null)
    // const checkHealthTimerWorker = useRef<Worker>(null)

    const [ connectionState, setConnectionState ] = useState<EWebsocketConnectionState>(EWebsocketConnectionState.CLOSED)

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

    // const createCheckHealthTimer = () => {
    //     if (checkHealthTimerWorker.current === null) {
    //         checkHealthTimerWorker.current = new Worker(new URL("./checkHealthTimer.js", import.meta.url))
    //         checkHealthTimerWorker.current!.onmessage = (event: MessageEvent) => {
    //             const count = event.data
    //             if (count % 60 === 0 || count === 0) {
    //                 pingServerMutateAsync()
    //                 sendWebSocketMessage({
    //                     type: EWebsocketClientEventType.CHECK_HEALTH,
    //                     message: {
    //                         message: "ping"
    //                     }
    //                 })
    //             }
    //         }
    //     }
    // }

    // const clearCheckHealthTimer = () => {
    //     if (checkHealthTimerWorker.current) {
    //         checkHealthTimerWorker.current.onmessage = null
    //         checkHealthTimerWorker.current.terminate()
    //         checkHealthTimerWorker.current = null
    //     }
    // }

    const closeWebSocketConnection = () => {
        window.electronAPI.closeWebsocket()
    }

    const createConnection = () => {
        window.electronAPI.onWebsocketConnectionState((event) => {
            console.log("Websocket Connection State", event);
            setConnectionState(event)
        })
        window.electronAPI.onPingServer(() => {
            pingServerMutateAsync()
        })
        window.electronAPI.initializeWebsocket()
        window.electronAPI.onWebsocketMessage((event) => {
            const message = event
            websocketEventHandlers(message)
        })

        // socket.current = null;
        // socket.current = new WebSocket(
        //     `${import.meta.env.VITE_TASKPRIO_WSS_URL}?connection_type=${isElectron ? "electron" : "webapp"}&client_id=${localStorage.getItem(import.meta.env.VITE_CLIENT_ID_LOCAL_STORAGE_NAME)}`
        // )
        // socket.current.onopen = () => {
        //     console.log("Connection open")
        //     createCheckHealthTimer()
        //     setConnected(true)
        //     initialConnection.current = false
        // }

        // socket.current.onclose = () => {
        //     console.log("Connection closed")
        //     clearCheckHealthTimer()
        //     setConnected(false)
        //     if (initialConnection.current === false) {
        //         setTimeout(() => {
        //             createConnection()
        //         }, 3000)
        //     }
        // }

        // socket.current.onerror = () => {
        //     console.log("Connection error")
        //     clearCheckHealthTimer()
        //     setConnected(false)
        //     if (initialConnection.current === false) {
        //         setTimeout(() => {
        //             createConnection()
        //         }, 3000)
        //     }
        // }
    }

    useLayoutEffect(() => {
        if ( !authenticated ) return
        createConnection()
        return () => {
            closeWebSocketConnection()
        }
    }, [ authenticated ])

    const contextValue = useMemo(() => ({
        connectionState,
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
        connectionState,
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
            }}
        >
            {children}
        </WebSocketContext.Provider>
    )

}