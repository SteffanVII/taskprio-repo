import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types";
import { create } from "zustand";

export type TWorkspaceStoreValues = {
    workspaceRole: EWorkspaceRole | null,
    selectedWorkspace: TWorkspace | null,
    noWorkspaces: boolean
}

export type TWorkspaceStoreActions = {
  setWorkspaceRole: (workspaceRole: EWorkspaceRole | null) => void,
  setSelectedWorkspace: (selectedWorkspace: TWorkspace | null) => void,
  setNoWorkspaces: (noWorkspaces: boolean) => void,
  resetStore: () => void
}

export type TWorkspaceStore = TWorkspaceStoreValues & TWorkspaceStoreActions

const initialState: TWorkspaceStoreValues = {
    workspaceRole: null,
    selectedWorkspace: null,

    noWorkspaces: false
}

export const useWorkspaceStore = create<TWorkspaceStore>(set => ({
  ...initialState,
  setWorkspaceRole: (workspaceRole: EWorkspaceRole | null) => set({ workspaceRole }),
  setSelectedWorkspace: (selectedWorkspace: TWorkspace | null) => set({ selectedWorkspace }),
  setNoWorkspaces: (noWorkspaces: boolean) => set({ noWorkspaces }),
  resetStore: () => set(() => ({ ...initialState }))
}))

export const useWorkspaceStore_workspaceRole = () => {
    return useWorkspaceStore(state => state.workspaceRole)
}

export const useWorkspaceStore_selectedWorkspace = () => {
    return useWorkspaceStore(state => state.selectedWorkspace)
}

export const useWorkspaceStore_noWorkspaces = () => {
    return useWorkspaceStore(state => state.noWorkspaces)
}