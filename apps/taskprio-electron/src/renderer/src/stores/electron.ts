import { DeepPartial } from "@/lib/globals"
import { TDisplay, TElectronStorePreferencesType } from "@repo/taskprio-types"
import { create } from "zustand"

type TElectronStoreValues = {
    isElectron: boolean,
    windowMaximize: boolean,
    displays: TDisplay[],
    preferences: DeepPartial<TElectronStorePreferencesType> | null,
  }
  
type TElectronStoreActions = {
  setIsElectron : ( value : boolean ) => void,
  setWindowMaximize : ( value : boolean ) => void,
  setDisplays : ( value : TDisplay[] ) => void,
  setPreferences : ( value : DeepPartial<TElectronStorePreferencesType> | null ) => void,
  resetStore : () => void
}

type TElectronStore = TElectronStoreValues & TElectronStoreActions;

const initialState: TElectronStoreValues= {
    isElectron: false,
    windowMaximize: false,
    displays: [],
    preferences: null
}

export const useElectronStore = create<TElectronStore>(set => ({
    ...initialState,
    setIsElectron : ( value : boolean ) => set({ isElectron : value }),
    setWindowMaximize : ( value : boolean ) => set({ windowMaximize : value }),
    setDisplays : ( value : TDisplay[] ) => set({ displays : value }),
    setPreferences : ( value : DeepPartial<TElectronStorePreferencesType> | null ) => set({ preferences : value }),
    resetStore : () => set({...initialState})
}))

export const useElectronStore_isElectron = () => {
    return useElectronStore(state => state.isElectron)
}

export const useElectronStore_windowMaximize = () => {
    return useElectronStore(state => state.windowMaximize)
}

export const useElectronStore_displays = () => useElectronStore(state => state.displays)
export const useElectronStore_preferences = () => useElectronStore(state => state.preferences)