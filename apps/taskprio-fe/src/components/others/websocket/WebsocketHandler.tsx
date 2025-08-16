import { TGetTaskboardSectionsResponse } from "@/services/private/tasksection/types"
import { TGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { EWebSocketEventType, TTask, TTaskSectionWithTasks, TTaskUpdateWebSocketMessageSimple, TWebSocketChangePathMessageSimple, TWebSocketMessage } from "@repo/taskprio-types/src"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { createContext, useLayoutEffect, useRef, useState } from "react"
import { produce } from "immer"

type TWebSocketContext = {
    connected : boolean,
    socket : WebSocket | null,
    closeWebSocketConnection : () => void,
    pathChangeMethods : {
        updateWorkspacePath : ( workspace_id : string ) => void,
        // updateProjectPath : ( project_id : string ) => void,
        // updateBoardPath : ( board_id : string ) => void
    }
}

export const WebSocketContext = createContext<TWebSocketContext>({
    connected : false,
    socket : null,
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

    const globalsStore = useGlobalsStore()

    const queryClient = useQueryClient()

    const [ connected, setConnected ] = useState(false)
    const socket = useRef<WebSocket | null>(null)

    const updateWorkspacePath = ( workspace_id : string ) => {
        const message : TWebSocketMessage<TWebSocketChangePathMessageSimple> = {
            type : EWebSocketEventType.PATH_CHANGE,
            data : {
                // The previous workspace id is the workspace id of the currently loaded workspace
                previous_workspace_id : globalsStore.selectedWorkspace?.workspace_id,
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

    const websocketEventHandlers = ( message : TWebSocketMessage ) => {

        switch ( message.type ) {
            case EWebSocketEventType.TASK_UPDATED:
                taskUpdateWebSocketMessageHandler( message, queryClient, globalsStore )
                break;
            default:
                break;
        }
    
    }

    useLayoutEffect(() => {
        if ( socket.current ) return
        if ( !globalsStore.authenticated ) return
        socket.current = new WebSocket(
            `${import.meta.env.VITE_TASKPRIO_WSS_URL}`
        )
        socket.current.onopen = () => {
            setConnected(true)
        }
        socket.current.onclose = () => {
            setConnected(false)
        }
    }, [ globalsStore.authenticated ] )

    useLayoutEffect(() => {
        if ( !connected ) return
        if ( !socket.current ) return
        socket.current!.onmessage = ( event ) => {
            const message = JSON.parse(event.data) as TWebSocketMessage
            websocketEventHandlers( message )
        }
    }, [ connected, globalsStore ])

    return (
        <WebSocketContext.Provider
            value={{
                connected,
                socket : socket.current,
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

const taskUpdateWebSocketMessageHandler = (
    message : TWebSocketMessage<TTask>,
    queryClient : QueryClient,
    globalsStore : TGlobalsStore
) => {

    const {
        selectedTaskboard
    } = globalsStore;

    queryClient.setQueryData(
        [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true ],
        ( oldData : TGetTaskboardSectionsResponse ) => produce( oldData, draft => {
            draft.forEach( section => {
                if ( section.task_section_id === message.data.task_section_id ) {
                    (section as TTaskSectionWithTasks).tasks = (section as TTaskSectionWithTasks).tasks.map( task => {
                        if ( task.task_id === message.data.task_id ) {
                            return {
                                ...message.data,
                                assignees : task.assignees
                            }
                        }
                        return task
                    } )
                }
            } )
        } )
    )

}