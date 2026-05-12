import { DeepPartial } from "@/lib/globals"
import { TDisplay, TElectronStorePreferencesType } from "@repo/taskprio-types"
import { Store, useStore } from "@tanstack/react-store"

type TElectronStore = {
    isElectron: boolean,
    windowMaximize: boolean,
    displays: TDisplay[],
    preferences: DeepPartial<TElectronStorePreferencesType> | null

}

const initialState: TElectronStore = {
    isElectron: false,
    windowMaximize: false,
    displays: [],
    preferences: null
}

const ElectronStore = new Store<TElectronStore>(initialState)

export const updateElectronStore = (store: Partial<TElectronStore>) => {
    ElectronStore.setState(prev => ({
        ...prev,
        ...store
    }))
}

export const useElectronStore_isElectron = () => {
    return useStore(ElectronStore, store => store.isElectron)
}

export const useElectronStore_windowMaximize = () => {
    return useStore(ElectronStore, store => store.windowMaximize)
}

export const useElectronStore_displays = () => useStore(ElectronStore, store => store.displays)
export const useElectronStore_preferences = () => useStore(ElectronStore, store => store.preferences)

export default ElectronStore;