import { TGetProjectTaskboardsResponse } from "@/services/private/taskboard/types"
import { TGetUserWorkspacesResponse } from "@/services/private/workspace/types"
import { EProjectRole, EWorkspaceRole, TProject, TUserSecure } from "@repo/taskprio-types/src/index"
import { TTask } from "@repo/taskprio-types/src/index"
import { TTaskboard } from "@repo/taskprio-types/src/index"
import { TWorkspace } from "@repo/taskprio-types/src/index"
import { Store, useStore } from "@tanstack/react-store"

export type TGlobalsStore = {

    authenticated : boolean,
    authenticateIsPending : boolean,
    logoutIsPending : boolean,

    user : TUserSecure | null,
    workspaceRole : EWorkspaceRole | null,
    projectRole : EProjectRole | null,

    invitationRecipient : TUserSecure | null,

    selectedWorkspace : TWorkspace | null,
    selectedProject : TProject | null,   
    selectedTaskboard : TTaskboard | null,
    selectedTask : TTask | null,

    workspaceIsFetching : boolean,
    workspaceIsLoading : boolean,

    workspaces : TGetUserWorkspacesResponse | undefined,
    workspacesIsFetching : boolean,
    workspacesIsLoading : boolean,
    workspacesIsError : boolean,
    noWorkspaces : boolean,

    projects : TProject[] | undefined,
    projectsIsFetching : boolean,
    projectsIsLoading : boolean,
    projectsIsError : boolean,
    noProjects : boolean,

    taskboards : TGetProjectTaskboardsResponse | undefined,
    taskboardsIsFetching : boolean,
    taskboardsIsLoading : boolean,
    taskboardsIsError : boolean,
    noTaskboards : boolean,

    taskTodoPageShowAvailableTasks : boolean
}

const initialState : TGlobalsStore = {
    authenticated : false,
    authenticateIsPending : false,
    logoutIsPending : false,

    user : null,
    workspaceRole : null,
    projectRole : null,

    invitationRecipient : null,

    selectedWorkspace : null,
    selectedProject : null,
    selectedTaskboard : null,
    selectedTask : null,

    workspaceIsFetching : false,
    workspaceIsLoading : false,

    workspaces : undefined,
    workspacesIsFetching : false,
    workspacesIsLoading : false,
    workspacesIsError : false,
    noWorkspaces : false,

    projects : undefined,
    projectsIsFetching : false,
    projectsIsLoading : false,
    projectsIsError : false,
    noProjects : false,

    taskboards : undefined,
    taskboardsIsFetching : false,
    taskboardsIsLoading : false,
    taskboardsIsError : false,
    noTaskboards : false,

    taskTodoPageShowAvailableTasks : false
}

const GlobalsStore = new Store<TGlobalsStore>(initialState)

export const updateGlobalsStore = ( store : Partial<TGlobalsStore> ) => {
    GlobalsStore.setState( (prev) => ({
        ...prev,
        ...store
    }) )
}

export const resetGlobalsStore = () => {
    GlobalsStore.setState( () => (initialState) )
}

export const useGlobalsStore = () => {
    return useStore(GlobalsStore)
}

export const useGlobalsStore_authenticated = () => {
    return useStore( GlobalsStore, store => store.authenticated )
}

export const useGlobalsStore_authenticateIsPending = () => {
    return useStore( GlobalsStore, store => store.authenticateIsPending )
}

export const useGlobalsStore_logoutIsPending = () => {
    return useStore( GlobalsStore, store => store.logoutIsPending )
}

export const useGlobalsStore_user = () => {
    return useStore( GlobalsStore, store => store.user )
}

export const useGlobalsStore_workspaceRole = () => {
    return useStore( GlobalsStore, store => store.workspaceRole )
}

export const useGlobalsStore_projectRole = () => {
    return useStore( GlobalsStore, store => store.projectRole )
}

export const useGlobalsStore_invitationRecipient = () => {
    return useStore( GlobalsStore, store => store.invitationRecipient )
}

export const useGlobalsStore_selectedWorkspace = () => {
    return useStore( GlobalsStore, store => store.selectedWorkspace )
}

export const useGlobalsStore_selectedProject = () => {
    return useStore( GlobalsStore, store => store.selectedProject )
}

export const useGlobalsStore_selectedTaskboard = () => {
    return useStore( GlobalsStore, store => store.selectedTaskboard )
}

export const useGlobalsStore_selectedTask = () => {
    return useStore( GlobalsStore, store => store.selectedTask )
}

export const useGlobalsStore_projectsIsLoading = () => {
    return useStore( GlobalsStore, store => store.projectsIsLoading )
}

export const useGlobalsStore_noProjects = () => {
    return useStore( GlobalsStore, store => store.noProjects )
}

export const useGlobalsStore_noTaskboards = () => {
    return useStore( GlobalsStore, store => store.noTaskboards )
}

export const useGlobalsStore_taskTodoPageShowAvailableTasks = () => {
    return useStore( GlobalsStore, store => store.taskTodoPageShowAvailableTasks )
}

export const useGlobalsStore_taskboardsIsFetching = () => {
    return useStore( GlobalsStore, store => store.taskboardsIsFetching )
}

export const useGlobalsStore_taskboardsIsLoading = () => {
    return useStore( GlobalsStore, store => store.taskboardsIsLoading )
}

export const useGlobalsStore_workspaceIsFetching = () => {
    return useStore( GlobalsStore, store => store.workspaceIsFetching )
}

export const useGlobalsStore_workspaceIsLoading = () => {
    return useStore( GlobalsStore, store => store.workspaceIsLoading )
}

export const useGlobalsStore_noWorkspaces = () => {
    return useStore( GlobalsStore, store => store.noWorkspaces )
}

export const useGlobalsStore_workspacesIsFetching = () => {
    return useStore( GlobalsStore, store => store.workspacesIsFetching )
}

export const useGlobalsStore_workspacesIsLoading = () => {
    return useStore( GlobalsStore, store => store.workspacesIsLoading )
}

export const useGlobalsStore_workspaces = () => {
    return useStore( GlobalsStore, store => store.workspaces )
}

export const useGlobalsStore_projects = () => {
    return useStore( GlobalsStore, store => store.projects )
}

export const useGlobalsStore_projectsIsFetching = () => {
    return useStore( GlobalsStore, store => store.projectsIsFetching )
}

export const useGlobalsStore_projectsIsError = () => {
    return useStore( GlobalsStore, store => store.projectsIsError )
}

export const useGlobalsStore_taskboardsIsError = () => {
    return useStore( GlobalsStore, store => store.taskboardsIsError )
}

export const useGlobalsStore_taskboards = () => {
    return useStore( GlobalsStore, store => store.taskboards )
}

export default GlobalsStore