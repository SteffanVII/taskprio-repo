import { Store, useStore } from "@tanstack/react-store"

type TElectronStore = {
    isElectron : boolean,
    windowMaximize : boolean
}

const initialState : TElectronStore = {
    isElectron : false,
    windowMaximize : false
}

const ElectronStore = new Store<TElectronStore>(initialState)

export const updateElectronStore = ( store : Partial<TElectronStore> ) => {
    ElectronStore.setState( prev => ({
        ...prev,
        ...store
    }) )
}

export const useElectronStore_isElectron = () => {
    return useStore( ElectronStore, store => store.isElectron )
}

export const useElectronStore_windowMaximize = () => {
    return useStore( ElectronStore, store => store.windowMaximize )
}

export default ElectronStore;