import dayjs from "@/lib/dayjs";
import { Store, useStore } from "@tanstack/react-store";

type TSessionHistoryTabStore = {
    selectedMembers: string[],
    dateRangeState: number,
    dateRange: string[]
}

const defaultValue: TSessionHistoryTabStore = {
    selectedMembers: [],
    dateRangeState: 1,
    dateRange: [dayjs().endOf("day").toISOString(), dayjs().startOf("day").toISOString()]
}

const SessionHistoryTabStore = new Store<TSessionHistoryTabStore>(defaultValue);

export const updateSessionHistoryTabStore = (store: Partial<TSessionHistoryTabStore>) => {
    SessionHistoryTabStore.setState(prev => ({
        ...prev,
        ...store
    }))
}

export const resetSessionHistoryTabStore = () => {
    updateSessionHistoryTabStore(defaultValue)
}

export const useSessionHistoryTabStore_selectedMembers = () => useStore(SessionHistoryTabStore, store => store.selectedMembers)
export const useSessionHistoryTabStore_dateRange = () => useStore(SessionHistoryTabStore, store => store.dateRange)
export const useSessionHistoryTabStore_dateRangeState = () => useStore(SessionHistoryTabStore, store => store.dateRangeState)