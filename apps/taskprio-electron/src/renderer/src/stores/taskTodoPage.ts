import { TGetAvailableTasksByProjectRequestQuery, TProjectWithUserAssignedTasks, TUserTaskTodoState } from "@repo/taskprio-types";
import { Store, useStore } from "@tanstack/react-store";

export enum ETaskTodoPageUIMode {
    FULL = "full",
    OVERLAY = "overlay",
    WIDGET = "widget"
}

type TTaskTodoPageStore = {
    sessionActive: boolean,

    totalCurrentWorkTimeString: string,
    totalWorkTimeGoalString: string,
    totalCurrentWorkTimeNumber: number,
    totalWorkTimeGoalNumber: number,

    topTaskTodo: TUserTaskTodoState | null,

    timerCount: number,

    userTaskTodoStateIsLoading: boolean,
    userTaskTodoStateIsFetching: boolean,

    taskTodoPageCompactMode: boolean,

    uIMode: ETaskTodoPageUIMode,

    projectColumnsFilterState: Record<string, TGetAvailableTasksByProjectRequestQuery>,

    selectedProjectList_availableTaskDrawer: TProjectWithUserAssignedTasks | null
}

const taskTodoPageStoreDefaultState: TTaskTodoPageStore = {
    sessionActive: false,

    totalCurrentWorkTimeString: "0s",
    totalWorkTimeGoalString: "0m",
    totalCurrentWorkTimeNumber: 0,
    totalWorkTimeGoalNumber: 0,

    topTaskTodo: null,

    timerCount: 0,

    userTaskTodoStateIsLoading: false,
    userTaskTodoStateIsFetching: false,

    taskTodoPageCompactMode: false,

    uIMode: ETaskTodoPageUIMode.FULL,

    projectColumnsFilterState: {},

    selectedProjectList_availableTaskDrawer: null

}

const TaskTodoPageStore = new Store<TTaskTodoPageStore>(taskTodoPageStoreDefaultState)

export const updateTaskTodoPageStore = (store: Partial<TTaskTodoPageStore>) => {
    TaskTodoPageStore.setState(prev => ({
        ...prev,
        ...store
    }))
}

const useTaskTodoPageStore = () => {
    return useStore(TaskTodoPageStore)
}

export const resetTaskTodoPageStore = () => {
    updateTaskTodoPageStore(taskTodoPageStoreDefaultState)
}

export const useTaskTodoPageStore_sessionActive = () => useStore(TaskTodoPageStore, store => store.sessionActive)
export const useTaskTodoPageStore_totalCurrentWorkTimeString = () => useStore(TaskTodoPageStore, store => store.totalCurrentWorkTimeString)
export const useTaskTodoPageStore_totalWorkTimeGoalString = () => useStore(TaskTodoPageStore, store => store.totalWorkTimeGoalString)
export const useTaskTodoPageStore_totalCurrentWorkTimeNumber = () => useStore(TaskTodoPageStore, store => store.totalCurrentWorkTimeNumber)
export const useTaskTodoPageStore_totalWorkTimeGoalNumber = () => useStore(TaskTodoPageStore, store => store.totalWorkTimeGoalNumber)
export const useTaskTodoPageStore_timerCount = () => useStore(TaskTodoPageStore, store => store.timerCount)
export const useTaskTodoPageStore_userTaskTodoStateIsLoading = () => useStore(TaskTodoPageStore, store => store.userTaskTodoStateIsLoading)
export const useTaskTodoPageStore_userTaskTodoStateIsFetching = () => useStore(TaskTodoPageStore, store => store.userTaskTodoStateIsFetching)
export const useTaskTodoPageStore_taskTodoPageCompactMode = () => useStore(TaskTodoPageStore, store => store.taskTodoPageCompactMode)
export const useTaskTodoPageStore_projectColumnsFilterState = () => useStore(TaskTodoPageStore, store => store.projectColumnsFilterState)
export const useTaskTodoPageStore_topTaskTodo = () => useStore(TaskTodoPageStore, store => store.topTaskTodo)
export const useTaskTodoPageStore_uIMode = () => useStore(TaskTodoPageStore, store => store.uIMode)
export const useTaskTodoPageStore_selectedProjectList_availableTaskDrawer = () => useStore(TaskTodoPageStore, store => store.selectedProjectList_availableTaskDrawer)

export default useTaskTodoPageStore