import { TGetAvailableTasksByProjectRequestQuery, TProjectWithUserAssignedTasks, TUserTaskTodoState } from "@repo/taskprio-types";
import { create } from "zustand";

export enum ETaskTodoPageUIMode {
    FULL = "full",
    OVERLAY = "overlay",
    WIDGET = "widget"
}

type TTaskTodoPageStoreValues = {
    sessionActive: boolean,

    totalCurrentWorkTimeString: string,
    totalWorkTimeGoalString: string,
    totalCurrentWorkTimeNumber: number,
    totalWorkTimeGoalNumber: number,

    topTaskTodo: TUserTaskTodoState | null,

    timerCount: number,

    taskTodoPageCompactMode: boolean,

    uIMode: ETaskTodoPageUIMode,

    projectColumnsFilterState: Record<string, TGetAvailableTasksByProjectRequestQuery>,

    selectedProjectList_availableTaskDrawer: TProjectWithUserAssignedTasks | null
}

type TTaskTodoPageStoreActions = {
  setSessionActive: (sessionActive: boolean) => void
  setTotalCurrentWorkTimeString: (totalCurrentWorkTimeString: string) => void
  setTotalWorkTimeGoalString: (totalWorkTimeGoalString: string) => void
  setTotalCurrentWorkTimeNumber: (totalCurrentWorkTimeNumber: number) => void
  setTotalWorkTimeGoalNumber: (totalWorkTimeGoalNumber: number) => void
  setTopTaskTodo: (topTaskTodo: TUserTaskTodoState | null) => void
  setTimerCount: (timerCount: number) => void
  setTaskTodoPageCompactMode: (taskTodoPageCompactMode: boolean) => void
  setUIMode: (uIMode: ETaskTodoPageUIMode) => void
  setProjectColumnsFilterState: (projectColumnsFilterState: Record<string, TGetAvailableTasksByProjectRequestQuery>) => void
  setSelectedProjectList_availableTaskDrawer: (selectedProjectList_availableTaskDrawer: TProjectWithUserAssignedTasks | null) => void
  resetStore: () => void
}

type TTaskTodoPageStore = TTaskTodoPageStoreValues & TTaskTodoPageStoreActions

const taskTodoPageStoreDefaultState: TTaskTodoPageStoreValues = {
    sessionActive: false,

    totalCurrentWorkTimeString: "0s",
    totalWorkTimeGoalString: "0m",
    totalCurrentWorkTimeNumber: 0,
    totalWorkTimeGoalNumber: 0,

    topTaskTodo: null,

    timerCount: 0,

    taskTodoPageCompactMode: false,

    uIMode: ETaskTodoPageUIMode.FULL,

    projectColumnsFilterState: {},

    selectedProjectList_availableTaskDrawer: null

}

export const useTaskTodoPageStore = create<TTaskTodoPageStore>(set => ({
    ...taskTodoPageStoreDefaultState,
    setSessionActive: (sessionActive: boolean) => set({ sessionActive }),
    setTotalCurrentWorkTimeString: (totalCurrentWorkTimeString: string) => set({ totalCurrentWorkTimeString }),
    setTotalWorkTimeGoalString: (totalWorkTimeGoalString: string) => set({ totalWorkTimeGoalString }),
    setTotalCurrentWorkTimeNumber: (totalCurrentWorkTimeNumber: number) => set({ totalCurrentWorkTimeNumber }),
    setTotalWorkTimeGoalNumber: (totalWorkTimeGoalNumber: number) => set({ totalWorkTimeGoalNumber }),
    setTopTaskTodo: (topTaskTodo: TUserTaskTodoState | null) => set({ topTaskTodo }),
    setTimerCount: (timerCount: number) => set({ timerCount }),
    setTaskTodoPageCompactMode: (taskTodoPageCompactMode: boolean) => set({ taskTodoPageCompactMode }),
    setUIMode: (uIMode: ETaskTodoPageUIMode) => set({ uIMode }),
    setProjectColumnsFilterState: (projectColumnsFilterState: Record<string, TGetAvailableTasksByProjectRequestQuery>) => set({ projectColumnsFilterState }),
    setSelectedProjectList_availableTaskDrawer: (selectedProjectList_availableTaskDrawer: TProjectWithUserAssignedTasks | null) => set({ selectedProjectList_availableTaskDrawer }),
    resetStore: () => set(() => ({ ...taskTodoPageStoreDefaultState }))
}))

export const useTaskTodoPageStore_sessionActive = () => useTaskTodoPageStore(state => state.sessionActive)
export const useTaskTodoPageStore_totalCurrentWorkTimeString = () => useTaskTodoPageStore(state => state.totalCurrentWorkTimeString)
export const useTaskTodoPageStore_totalWorkTimeGoalString = () => useTaskTodoPageStore(state => state.totalWorkTimeGoalString)
export const useTaskTodoPageStore_totalCurrentWorkTimeNumber = () => useTaskTodoPageStore(state => state.totalCurrentWorkTimeNumber)
export const useTaskTodoPageStore_totalWorkTimeGoalNumber = () => useTaskTodoPageStore(state => state.totalWorkTimeGoalNumber)
export const useTaskTodoPageStore_timerCount = () => useTaskTodoPageStore(state => state.timerCount)
export const useTaskTodoPageStore_taskTodoPageCompactMode = () => useTaskTodoPageStore(state => state.taskTodoPageCompactMode)
export const useTaskTodoPageStore_projectColumnsFilterState = () => useTaskTodoPageStore(state => state.projectColumnsFilterState)
export const useTaskTodoPageStore_topTaskTodo = () => useTaskTodoPageStore(state => state.topTaskTodo)
export const useTaskTodoPageStore_uIMode = () => useTaskTodoPageStore(state => state.uIMode)
export const useTaskTodoPageStore_selectedProjectList_availableTaskDrawer = () => useTaskTodoPageStore(state => state.selectedProjectList_availableTaskDrawer)