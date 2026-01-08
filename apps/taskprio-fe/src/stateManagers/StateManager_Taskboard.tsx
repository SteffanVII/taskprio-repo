import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { useGetProjectTaskboards } from "@/services/private/taskboard/query"
import { updateGlobalsStore, useGlobalsStore_selectedProject, useGlobalsStore_selectedTaskboard, useGlobalsStore_selectedWorkspace } from "@/stores/globals"
import React, { useContext, useEffect, useLayoutEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

type TStateManager_Taskboard = {
    children : React.ReactNode
}

const StateManager_Taskboard : React.FC<TStateManager_Taskboard> = ({ children }) => {

    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { project_id, task_board_id } = useParams()
    const {
        channelActions
    } = useContext(WebSocketContext)

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()

    const {
        data : taskboards,
        isFetching : taskboardsIsFetching,
        isLoading : taskboardsIsLoading,
        isError : taskboardsIsError
    } = useGetProjectTaskboards( {
        payload : {
            query : {
                project_id : project_id
            }
        },
        options : {
            enabled : !!selectedProject
        }
    } )

    useEffect(() => {
        updateGlobalsStore({
            taskboards,
            taskboardsIsFetching,
            taskboardsIsLoading,
            taskboardsIsError,
            noTaskboards : (taskboards && taskboards.length < 1) ?? false
        })
    }, [
        taskboards,
        taskboardsIsFetching,
        taskboardsIsLoading,
        taskboardsIsError
    ])

    useLayoutEffect(() => {
        if ( pathname.includes("/project_settings") ) return
        if ( !task_board_id ) {
            if ( taskboards && !taskboardsIsFetching ) {
                if ( taskboards.length > 0 ) {
                    // Check if the selected project is the same as the project_id
                    // If it's not means the user might have switched project and the project data hasn't fetched yet
                    // This is to prevent fetching the taskboard data that doesn't belong to the selected project
                    if ( selectedProject?.project_id === project_id ) {
                        updateGlobalsStore({
                            selectedTaskboard : taskboards[0],
                            noTaskboards : false
                        })
                        navigate( `/p/w/${selectedWorkspace?.workspace_id}/d/${selectedProject?.project_id}/t/${taskboards[0].task_board_id}` )
                    }
                }
            }
        }
    }, [
        taskboards,
        task_board_id,
        selectedProject,
        selectedWorkspace,
        project_id,
        taskboardsIsFetching,
        pathname
    ])

    // Update the selected taskboard in the globals store
    useLayoutEffect(() => {
        if ( !selectedTaskboard && task_board_id ) {
            const foundTaskboard = taskboards?.find( taskboard => taskboard.task_board_id === task_board_id ) ?? null
            updateGlobalsStore({
                selectedTaskboard : foundTaskboard,
                noTaskboards : false
            })
            if ( foundTaskboard ) {
                channelActions.joinTaskboardChannel(foundTaskboard.task_board_id)
            }
        }
    }, [ taskboards, task_board_id, selectedTaskboard ])

    // Set noTaskboards global store state
    useLayoutEffect(() => {
        updateGlobalsStore({
            noTaskboards : (taskboards && !taskboardsIsFetching && taskboards.length < 1)
        })
    }, [ taskboards, taskboardsIsFetching ])

    return children;

}

export default StateManager_Taskboard;