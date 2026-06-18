import { EProjectRole, TProject } from "@repo/taskprio-types";
import { create } from "zustand";

export type TProjectStoreValues = {
    projectRole: EProjectRole | null,
    selectedProject: TProject | null,
    noProjects: boolean,
}

export type TProjectStoreActions = {
  setProjectRole: (projectRole: EProjectRole | null) => void,
  setSelectedProject: (selectedProject: TProject | null) => void,
  setNoProjects: (noProjects: boolean) => void,
  resetStore: () => void,
}

export type TProjectStore = TProjectStoreValues & TProjectStoreActions

const initialState: TProjectStoreValues = {
    projectRole: null,
    selectedProject: null,
    noProjects: false,
}

export const useProjectStore = create<TProjectStore>(set => ({
    ...initialState,
    setProjectRole: (projectRole: EProjectRole | null) => set({ projectRole }),
    setSelectedProject: (selectedProject: TProject | null) => set({ selectedProject }),
    setNoProjects: (noProjects: boolean) => set({ noProjects }),
    resetStore: () => set(() => ({ ...initialState }))
}))

export const useProjectStore_projectRole = () => {
    return useProjectStore(state => state.projectRole)
}

export const useProjectStore_selectedProject = () => {
    return useProjectStore(state => state.selectedProject)
}

export const useProjectStore_noProjects = () => {
    return useProjectStore(state => state.noProjects)
}