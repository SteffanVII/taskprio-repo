import { TUserSecure } from "@repo/taskprio-types"
import { TTask } from "@repo/taskprio-types"
import { Store, useStore } from "@tanstack/react-store"

export type TGlobalsStore = {
    authenticated: boolean,
    authenticateIsPending: boolean,
    logoutIsPending: boolean,

    user: TUserSecure | null,

    invitationRecipient: TUserSecure | null,
    selectedTask: TTask | null,

    taskTodoPageShowAvailableTasks: boolean
}

const initialState: TGlobalsStore = {
    authenticated: false,
    authenticateIsPending: false,
    logoutIsPending: false,

    user: null,

    invitationRecipient: null,
    selectedTask: null,

    taskTodoPageShowAvailableTasks: false
}

const GlobalsStore = new Store<TGlobalsStore>(initialState)

export const updateGlobalsStore = (store: Partial<TGlobalsStore>) => {
    GlobalsStore.setState((prev) => ({
        ...prev,
        ...store
    }))
}

export const resetGlobalsStore = () => {
    GlobalsStore.setState(() => ({ ...initialState }))
}

export const useGlobalsStore = () => {
    return useStore(GlobalsStore)
}

export const useGlobalsStore_authenticated = () => {
    return useStore(GlobalsStore, store => store.authenticated)
}

export const useGlobalsStore_authenticateIsPending = () => {
    return useStore(GlobalsStore, store => store.authenticateIsPending)
}

export const useGlobalsStore_logoutIsPending = () => {
    return useStore(GlobalsStore, store => store.logoutIsPending)
}

export const useGlobalsStore_user = () => {
    return useStore(GlobalsStore, store => store.user)
}

export const useGlobalsStore_invitationRecipient = () => {
    return useStore(GlobalsStore, store => store.invitationRecipient)
}

export const useGlobalsStore_selectedTask = () => {
    return useStore(GlobalsStore, store => store.selectedTask)
}

export const useGlobalsStore_taskTodoPageShowAvailableTasks = () => {
    return useStore(GlobalsStore, store => store.taskTodoPageShowAvailableTasks)
}

export default GlobalsStore