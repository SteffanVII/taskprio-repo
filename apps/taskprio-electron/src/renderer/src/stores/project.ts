import { EProjectRole, TProject } from "@repo/taskprio-types";
import { Store, useStore } from "@tanstack/react-store";

export type TProjectStore = {
    projectRole: EProjectRole | null,
    selectedProject: TProject | null,

    projects: TProject[] | undefined,
    projectsIsFetching: boolean,
    projectsIsLoading: boolean,
    projectsIsError: boolean,
    noProjects: boolean,
}

const initialState: TProjectStore = {
    projectRole: null,
    selectedProject: null,

    projects: undefined,
    projectsIsFetching: false,
    projectsIsLoading: false,
    projectsIsError: false,
    noProjects: false,
}

const ProjectStore = new Store<TProjectStore>(initialState)

export const updateProjectStore = (store: Partial<TProjectStore>) => {
    ProjectStore.setState((prev) => ({
        ...prev,
        ...store
    }))
}

export const resetProjectStore = () => {
    ProjectStore.setState(() => ({ ...initialState }))
}

export const useProjectStore = () => {
    return useStore(ProjectStore)
}

export const useProjectStore_projectRole = () => {
    return useStore(ProjectStore, store => store.projectRole)
}

export const useProjectStore_selectedProject = () => {
    return useStore(ProjectStore, store => store.selectedProject)
}

export const useProjectStore_projects = () => {
    return useStore(ProjectStore, store => store.projects)
}

export const useProjectStore_projectsIsFetching = () => {
    return useStore(ProjectStore, store => store.projectsIsFetching)
}

export const useProjectStore_projectsIsLoading = () => {
    return useStore(ProjectStore, store => store.projectsIsLoading)
}

export const useStoreProject_projectsIsError = () => {
    return useStore(ProjectStore, store => store.projectsIsError)
}

export const useProjectStore_noProjects = () => {
    return useStore(ProjectStore, store => store.noProjects)
}

export default ProjectStore
