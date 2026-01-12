import { TGetUserWorkspacesResponse } from "@/services/private/workspace/types"
import { updateGlobalsStore, useGlobalsStore_projects, useGlobalsStore_selectedWorkspace, useGlobalsStore_user, useGlobalsStore_workspaces } from "@/stores/globals"
import { resetSessionHistoryTabStore } from "@/stores/sessionHistoryTab"
import { resetTaskTodoPageStore } from "@/stores/taskTodoPage"
import { TWebSocketMessage, TWorkspace, TWorkspaceMemberDeactivatedWebSocketMessage } from "@repo/taskprio-types/src"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router"


export const useWorkspaceEventHandlers = () => {
    
    const navigate = useNavigate()

    const user = useGlobalsStore_user()
    const workspaces = useGlobalsStore_workspaces()
    const projects = useGlobalsStore_projects()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const workspaceMemberDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

        let newWorkspaces : TGetUserWorkspacesResponse | undefined;
        let newSelectedWorkspace : TWorkspace | null = selectedWorkspace;
        
        if ( message.message.member_id === user?.user_id ) {
            newWorkspaces = workspaces ? workspaces.filter( workspace => workspace.workspace_id !== message.message.workspace_id ) : undefined
            updateGlobalsStore({
                workspaces : newWorkspaces,
                noWorkspaces : newWorkspaces ? newWorkspaces.length === 0 : false,
                selectedWorkspace : null,
                projects : undefined,
                noProjects : false,
                taskboards : undefined,
                selectedTaskboard : null,
                noTaskboards : false,
                selectedTask : null,
                workspaceRole : null
            })
            resetSessionHistoryTabStore()
            resetTaskTodoPageStore()
            if ( selectedWorkspace?.workspace_id === message.message.workspace_id ) {
                navigate(`/p/w`)
            }
        } else {
            if ( workspaces ) {
                newWorkspaces = workspaces.map( workspace => {
                    if ( workspace.workspace_id === message.message.workspace_id ) {
                        return {
                            ...workspace,
                            members: workspace.workspace_members.map( workspace_member => {
                                if ( workspace_member.user_id === message.message.member_id ) {
                                    return {
                                        ...workspace_member,
                                        is_active: false
                                    }
                                } else {
                                    return workspace_member
                                }
                            } )
                        }
                    } else {
                        return workspace
                    }
                } )
            }
            if ( selectedWorkspace?.workspace_id === message.message.workspace_id && newSelectedWorkspace ) {
                newSelectedWorkspace = {
                    ...newSelectedWorkspace,
                    workspace_members : newSelectedWorkspace.workspace_members.map( member => {
                        if ( member.user_id === message.message.member_id ) {
                            return {
                                ...member,
                                is_active : false
                            }
                        } else {
                            return member
                        }
                    } )
                }
            }
            updateGlobalsStore({
                workspaces : newWorkspaces,
                selectedWorkspace : newSelectedWorkspace,
            })
        }


    }, [
        user,
        selectedWorkspace,
        projects
    ])
    
    return useMemo(() => ({
        workspaceMemberDeactivatedWebSocketMessageHandler
    }), [
        workspaceMemberDeactivatedWebSocketMessageHandler
    ])

}