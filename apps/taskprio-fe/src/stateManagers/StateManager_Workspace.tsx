import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace, useGlobalsStore_user } from "@/stores/globals";
import React, { useContext, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { EWorkspaceRole } from "@repo/taskprio-types/src";
import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider";

type TStateManager_Workspace = {
    children : React.ReactNode
}

const StateManager_Workspace : React.FC<TStateManager_Workspace> = ({ children }) => {

    const navigate = useNavigate()

    const { pathname } = useLocation()
    const { workspace_id } = useParams()

    const user = useGlobalsStore_user()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const {
        connected : webSocketConnected,
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        data : workspaces,
        isFetching : workspacesIsFetching,
        isLoading : workspacesIsLoading,
        isError : workspacesIsError
    } = useGetUserWorkspaces({
        enabled : webSocketConnected
    })

    useEffect(() => {
        updateGlobalsStore({
            workspaces,
            workspacesIsFetching,
            workspacesIsLoading,
            workspacesIsError,
            noWorkspaces : (workspaces && workspaces.length < 1) ?? false
        })
    }, [
        workspaces,
        workspacesIsFetching,
        workspacesIsLoading,
        workspacesIsError
    ])

    // If no workspace_id is selected, navigate to the first workspace once the workspaces data are available
    useLayoutEffect(() => {
        console.log(pathname);
        console.log(workspace_id)
        console.log(
            pathname.includes("/workspace_settings") ||
            pathname.includes("/tt") ||
            pathname.includes("/profile") ||
            pathname.includes("/task_todo_overlay")
        );
        // If the user is on the workspace settings page or task todo apge, don't navigate to the first workspace
        if (
            pathname.includes("/workspace_settings") ||
            pathname.includes("/tt") ||
            pathname.includes("/profile") ||
            pathname.includes("/task_todo_overlay")
        ) return

        if ( !workspace_id ) {
            if ( workspaces && workspaces.length > 0 ) {
                navigate(`/p/w/${workspaces[0].workspace_id}`)
            }
        }
    }, [ workspaces, workspace_id ])

    useLayoutEffect(() => {
        // If selectedWorkspace is null or selectedWorkspace doesn't match the workspace_id
        // Try to find the workspace in workspaces data to be set as selectedWorkspace
        // This doesn't set to other the first workspace if workspace isn't found
        // This is only for when the webapp is loaded already in a workspace route but doesn't have selectedWorkspace data set yet
        // if ( (!selectedWorkspace || ( selectedWorkspace && selectedWorkspace.workspace_id !== workspace_id )) && workspace_id ) {
        if ( !selectedWorkspace && workspace_id ) {
            const foundWorkspace = workspaces?.find( workspace => workspace.workspace_id === workspace_id ) ?? null;
            const workspaceRole : EWorkspaceRole | null = foundWorkspace?.workspace_members.find( member => member.user_id === user?.user_id )?.workspace_role ?? null;
            updateGlobalsStore({
                selectedWorkspace : foundWorkspace,
                workspaceRole,
                noProjects : false,
                noTaskboards : false
            })
            if ( foundWorkspace ) {
                pathChangeMethods.updateWorkspacePath(foundWorkspace.workspace_id)
            }
        }
    }, [
        workspace_id,
        workspaces,
        selectedWorkspace
    ])

    // Set noWorkspaces global store state
    useLayoutEffect(() => {
        updateGlobalsStore({
            noWorkspaces : (workspaces && !workspacesIsFetching && workspaces.length < 1)
        })
    }, [ workspaces, workspacesIsFetching ])

    return children

}

export default StateManager_Workspace;