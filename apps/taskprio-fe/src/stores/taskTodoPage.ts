import { Store, useStore } from "@tanstack/react-store";

type TTaskTodoPageStore = {
    sessionActive : boolean,

    totalCurrentWorkTimeString : string,
    totalWorkTimeGoalString : string,
    totalCurrentWorkTimeNumber : number,
    totalWorkTimeGoalNumber : number,

    timerCount : number,

    userTaskTodoStateIsLoading : boolean,
    userTaskTodoStateIsFetching : boolean,

    taskTodoPageCompactMode : boolean
}

const taskTodoPageStoreDefaultState : TTaskTodoPageStore = {
    sessionActive : false,

    totalCurrentWorkTimeString : "0s",
    totalWorkTimeGoalString : "0m",
    totalCurrentWorkTimeNumber : 0,
    totalWorkTimeGoalNumber : 0,

    timerCount : 0,

    userTaskTodoStateIsLoading : false,
    userTaskTodoStateIsFetching : false,

    taskTodoPageCompactMode : false
}

const TaskTodoPageStore = new Store<TTaskTodoPageStore>(taskTodoPageStoreDefaultState)

export const updateTaskTodoPageStore = ( store : Partial<TTaskTodoPageStore> ) => {
    TaskTodoPageStore.setState( prev => ({
        ...prev,
        ...store
    }) )
}

const useTaskTodoPageStore = () => {
    return useStore( TaskTodoPageStore )
}

export const resetTaskTodoPageStore = () => {
    updateTaskTodoPageStore(taskTodoPageStoreDefaultState)
}

export const useTaskTodoPageStore_sessionActive = () => useStore( TaskTodoPageStore, store => store.sessionActive)
export const useTaskTodoPageStore_totalCurrentWorkTimeString = () => useStore( TaskTodoPageStore, store => store.totalCurrentWorkTimeString)
export const useTaskTodoPageStore_totalWorkTimeGoalString = () => useStore( TaskTodoPageStore, store => store.totalWorkTimeGoalString)
export const useTaskTodoPageStore_totalCurrentWorkTimeNumber = () => useStore( TaskTodoPageStore, store => store.totalCurrentWorkTimeNumber)
export const useTaskTodoPageStore_totalWorkTimeGoalNumber = () => useStore( TaskTodoPageStore, store => store.totalWorkTimeGoalNumber)
export const useTaskTodoPageStore_timerCount = () => useStore( TaskTodoPageStore, store => store.timerCount)
export const useTaskTodoPageStore_userTaskTodoStateIsLoading = () => useStore( TaskTodoPageStore, store => store.userTaskTodoStateIsLoading)
export const useTaskTodoPageStore_userTaskTodoStateIsFetching = () => useStore( TaskTodoPageStore, store => store.userTaskTodoStateIsFetching)
export const useTaskTodoPageStore_taskTodoPageCompactMode = () => useStore( TaskTodoPageStore, store => store.taskTodoPageCompactMode)

export default useTaskTodoPageStore