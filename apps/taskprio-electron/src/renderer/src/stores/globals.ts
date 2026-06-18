import { TUserSecure } from "@repo/taskprio-types"
import { TTask } from "@repo/taskprio-types"
import { create } from "zustand";

export type TGlobalsStoreValues = {
  authenticated: boolean,

  user: TUserSecure | null,

  invitationRecipient: TUserSecure | null,
  selectedTask: TTask | null,

  taskTodoPageShowAvailableTasks: boolean
}

export type TGlobalsStoreActions = {
  setAuthenticated : ( value: boolean ) => void,
  setUser : ( value : TUserSecure | null ) => void,
  setInvitationRecipient : ( value : TUserSecure | null ) => void,
  setSelectedTask : ( value : TTask | null ) => void,
  setTaskTodoPageShowAvailableTasks : ( value : boolean ) => void,
  resetStore : () => void
}

export type TGlobalsStore = TGlobalsStoreValues & TGlobalsStoreActions

const initialState: TGlobalsStoreValues = {
  authenticated: false,

  user: null,

  invitationRecipient: null,
  selectedTask: null,

  taskTodoPageShowAvailableTasks: false
}

export const useGlobalsStore = create<TGlobalsStore>((set) => ({
  ...initialState,
  setAuthenticated : ( value: boolean ) => {
    set({
      authenticated: value
    })
  },
  setUser : ( value : TUserSecure | null ) => set({ user : value }),
  setInvitationRecipient : ( value : TUserSecure | null ) => set({ invitationRecipient : value }),
  setSelectedTask : ( value : TTask | null ) => set({ selectedTask : value }),
  setTaskTodoPageShowAvailableTasks : ( value : boolean ) => set({ taskTodoPageShowAvailableTasks : value }),
  resetStore : () => set({...initialState})
}))

export const useGlobalsStore_authenticated = () => {
  return useGlobalsStore(state => state.authenticated)
}

export const useGlobalsStore_user = () => {
  return useGlobalsStore(state => state.user)
}

export const useGlobalsStore_invitationRecipient = () => {
  return useGlobalsStore(state => state.invitationRecipient)
}

export const useGlobalsStore_selectedTask = () => {
  return useGlobalsStore(state => state.selectedTask)
}

export const useGlobalsStore_taskTodoPageShowAvailableTasks = () => {
  return useGlobalsStore(state => state.taskTodoPageShowAvailableTasks)
}