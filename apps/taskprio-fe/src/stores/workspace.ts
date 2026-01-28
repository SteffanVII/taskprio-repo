import { TGetUserWorkspacesResponse } from "@/services/private/workspace/types";
import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types";
import { Store, useStore } from "@tanstack/react-store";

export type TWorkspaceStore = {
    workspaceRole: EWorkspaceRole | null,
    selectedWorkspace: TWorkspace | null,

    workspaceIsFetching: boolean,
    workspaceIsLoading: boolean,

    workspaces: TGetUserWorkspacesResponse | undefined,
    workspacesIsFetching: boolean,
    workspacesIsLoading: boolean,
    workspacesIsError: boolean,
    noWorkspaces: boolean
}

const initialState: TWorkspaceStore = {
    workspaceRole: null,
    selectedWorkspace: null,

    workspaceIsFetching: false,
    workspaceIsLoading: false,

    workspaces: undefined,
    workspacesIsFetching: false,
    workspacesIsLoading: false,
    workspacesIsError: false,
    noWorkspaces: false
}

const WorkspaceStore = new Store<TWorkspaceStore>(initialState)

export const updateWorkspaceStore = (store: Partial<TWorkspaceStore>) => {
    WorkspaceStore.setState((prev) => ({
        ...prev,
        ...store
    }))
}

export const resetWorkspaceStore = () => {
    WorkspaceStore.setState(() => ({ ...initialState }))
}

export const useWorkspaceStore = () => {
    return useStore(WorkspaceStore)
}

export const useWorkspaceStore_workspaceRole = () => {
    return useStore(WorkspaceStore, store => store.workspaceRole)
}

export const useWorkspaceStore_selectedWorkspace = () => {
    return useStore(WorkspaceStore, store => store.selectedWorkspace)
}

export const useWorkspaceStore_workspaceIsFetching = () => {
    return useStore(WorkspaceStore, store => store.workspaceIsFetching)
}

export const useWorkspaceStore_workspaceIsLoading = () => {
    return useStore(WorkspaceStore, store => store.workspaceIsLoading)
}

export const useWorkspaceStore_workspaces = () => {
    return useStore(WorkspaceStore, store => store.workspaces)
}

export const useWorkspaceStore_workspacesIsFetching = () => {
    return useStore(WorkspaceStore, store => store.workspacesIsFetching)
}

export const useWorkspaceStore_workspacesIsLoading = () => {
    return useStore(WorkspaceStore, store => store.workspacesIsLoading)
}

export const useWorkspaceStore_workspacesIsError = () => {
    return useStore(WorkspaceStore, store => store.workspacesIsError)
}

export const useWorkspaceStore_noWorkspaces = () => {
    return useStore(WorkspaceStore, store => store.noWorkspaces)
}

export default WorkspaceStore