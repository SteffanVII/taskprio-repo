import dayjs from "@/lib/dayjs";
import { create } from "zustand";

type TSessionHistoryTabStoreValues = {
  selectedMembers: string[],
  dateRangeState: number,
  dateRange: string[]
}

type TSessionHistoryTabStoreActions = {
  setSelectedMembers: (members: string[]) => void,
  setDateRangeState: (dateRangeState: number) => void,
  setDateRange: (dateRange: string[]) => void,
  resetStore: () => void
}

type TSessionHistoryTabStore = TSessionHistoryTabStoreValues & TSessionHistoryTabStoreActions

const defaultValue: TSessionHistoryTabStoreValues = {
  selectedMembers: [],
  dateRangeState: 1,
  dateRange: [dayjs().endOf("day").toISOString(), dayjs().startOf("day").toISOString()]
}

export const useSessionHistoryTabStore = create<TSessionHistoryTabStore>(set => ({
  ...defaultValue,
  setSelectedMembers: (members: string[]) => {
    set(() => ({
      selectedMembers: members
    }))
  },
  setDateRangeState: (dateRangeState: number) => {
    set(() => ({
      dateRangeState: dateRangeState
    }))
  },
  setDateRange: (dateRange: string[]) => {
    set(() => ({
      dateRange: dateRange
    }))
  },
  resetStore: () => set({...defaultValue})
}))

export const useSessionHistoryTabStore_selectedMembers = () => useSessionHistoryTabStore(state => state.selectedMembers)
export const useSessionHistoryTabStore_dateRange = () => useSessionHistoryTabStore(state => state.dateRange)
export const useSessionHistoryTabStore_dateRangeState = () => useSessionHistoryTabStore(state => state.dateRangeState)