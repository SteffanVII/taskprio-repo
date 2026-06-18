import { TTaskboard } from "@repo/taskprio-types"
import { create } from "zustand"

export type TTaskboardStoreValues = {
    selectedTaskboard: TTaskboard | null,
    noTaskboards: boolean,
}

export type TTaskboardStoreActions = {
    setSelectedTaskboard: (selectedTaskboard: TTaskboard | null) => void,
    setNoTaskboards: (noTaskboards: boolean) => void,
    resetStore: () => void,
}

export type TTaskboardStore = TTaskboardStoreValues & TTaskboardStoreActions

const initialState: TTaskboardStoreValues = {
    selectedTaskboard: null,
    noTaskboards: false,
}

export const useTaskboardStore = create<TTaskboardStore>(set => ({
  ...initialState,
  setSelectedTaskboard: (selectedTaskboard: TTaskboard | null) => set({ selectedTaskboard }),
  setNoTaskboards: (noTaskboards: boolean) => set({ noTaskboards }),
  resetStore: () => set(() => ({ ...initialState }))
}))

export const useTaskboardStore_selectedTaskboard = () => {
    return useTaskboardStore(state => state.selectedTaskboard)
}

export const useTaskboardStore_noTaskboards = () => {
    return useTaskboardStore(state => state.noTaskboards)
}