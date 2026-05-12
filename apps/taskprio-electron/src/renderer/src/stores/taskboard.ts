import { TGetProjectTaskboardsResponse } from "@/services/private/taskboard/types"
import { TTaskboard } from "@repo/taskprio-types"
import { Store, useStore } from "@tanstack/react-store"

export type TTaskboardStore = {
    selectedTaskboard: TTaskboard | null,
    taskboards: TGetProjectTaskboardsResponse | undefined,
    taskboardsIsFetching: boolean,
    taskboardsIsLoading: boolean,
    taskboardsIsError: boolean,
    noTaskboards: boolean,
}

const initialState: TTaskboardStore = {
    selectedTaskboard: null,
    taskboards: undefined,
    taskboardsIsFetching: false,
    taskboardsIsLoading: false,
    taskboardsIsError: false,
    noTaskboards: false,
}

const TaskboardStore = new Store<TTaskboardStore>(initialState)

export const updateTaskboardStore = (store: Partial<TTaskboardStore>) => {
    TaskboardStore.setState((prev) => ({
        ...prev,
        ...store
    }))
}

export const resetTaskboardStore = () => {
    TaskboardStore.setState(() => ({ ...initialState }))
}

export const useTaskboardStore = () => {
    return useStore(TaskboardStore)
}

export const useTaskboardStore_selectedTaskboard = () => {
    return useStore(TaskboardStore, store => store.selectedTaskboard)
}


export const useTaskboardStore_taskboards = () => {
    return useStore(TaskboardStore, store => store.taskboards)
}

export const useTaskboardStore_taskboardsIsFetching = () => {
    return useStore(TaskboardStore, store => store.taskboardsIsFetching)
}

export const useTaskboardStore_taskboardsIsLoading = () => {
    return useStore(TaskboardStore, store => store.taskboardsIsLoading)
}

export const useTaskboardStore_taskboardsIsError = () => {
    return useStore(TaskboardStore, store => store.taskboardsIsError)
}

export const useTaskboardStore_noTaskboards = () => {
    return useStore(TaskboardStore, store => store.noTaskboards)
}

export default TaskboardStore
