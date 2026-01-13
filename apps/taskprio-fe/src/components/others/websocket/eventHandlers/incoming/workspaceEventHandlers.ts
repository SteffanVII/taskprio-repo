import { TGetUserWorkspacesResponse } from "@/services/private/workspace/types"
import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { updateTaskboardStore } from "@/stores/taskboard"
import { updateProjectStore, useProjectStore_projects } from "@/stores/project"
import { updateWorkspaceStore, useWorkspaceStore_selectedWorkspace, useWorkspaceStore_workspaces } from "@/stores/workspace"
import { resetSessionHistoryTabStore } from "@/stores/sessionHistoryTab"
import { resetTaskTodoPageStore } from "@/stores/taskTodoPage"
import { TWebSocketMessage, TWorkspace, TWorkspaceMemberDeactivatedWebSocketMessage } from "@repo/taskprio-types/src"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router"


export const useWorkspaceEventHandlers = () => {

    const navigate = useNavigate()

    const user = useGlobalsStore_user()
    const workspaces = useWorkspaceStore_workspaces()
    const projects = useProjectStore_projects()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const workspaceMemberDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TWorkspaceMemberDeactivatedWebSocketMessage>) => {

        let newWorkspaces: TGetUserWorkspacesResponse | undefined;
        let newSelectedWorkspace: TWorkspace | null = selectedWorkspace;

        if (message.message.member_id === user?.user_id) {
            newWorkspaces = workspaces ? workspaces.filter(workspace => workspace.workspace_id !== message.message.workspace_id) : undefined
            updateWorkspaceStore({
                workspaces: newWorkspaces,
                noWorkspaces: newWorkspaces ? newWorkspaces.length === 0 : false,
                selectedWorkspace: null,
                workspaceRole: null
            })
            updateProjectStore({
                projects: undefined,
                noProjects: false,
            })
            updateGlobalsStore({
                selectedTask: null,
            })
            updateTaskboardStore({
                taskboards: undefined,
                selectedTaskboard: null,
                noTaskboards: false,
            })
            resetSessionHistoryTabStore()
            resetTaskTodoPageStore()
            if (selectedWorkspace?.workspace_id === message.message.workspace_id) {
                navigate(`/p/w`)
            }
        } else {
            if (workspaces) {
                newWorkspaces = workspaces.map(workspace => {
                    if (workspace.workspace_id === message.message.workspace_id) {
                        return {
                            ...workspace,
                            members: workspace.workspace_members.map(workspace_member => {
                                if (workspace_member.user_id === message.message.member_id) {
                                    return {
                                        ...workspace_member,
                                        is_active: false
                                    }
                                } else {
                                    return workspace_member
                                }
                            })
                        }
                    } else {
                        return workspace
                    }
                })
            }
            if (selectedWorkspace?.workspace_id === message.message.workspace_id && newSelectedWorkspace) {
                newSelectedWorkspace = {
                    ...newSelectedWorkspace,
                    workspace_members: newSelectedWorkspace.workspace_members.map(member => {
                        if (member.user_id === message.message.member_id) {
                            return {
                                ...member,
                                is_active: false
                            }
                        } else {
                            return member
                        }
                    })
                }
            }
            updateWorkspaceStore({
                workspaces: newWorkspaces,
                selectedWorkspace: newSelectedWorkspace,
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