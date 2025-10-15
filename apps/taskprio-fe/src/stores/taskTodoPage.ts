import { Store, useStore } from "@tanstack/react-store";

type TTaskTodoPageStore = {
    sessionActive : boolean,

    totalCurrentWorkTimeString : string,
    totalWorkTimeGoalString : string,

    timerCount : number

}

const taskTodoPageStoreDefaultState : TTaskTodoPageStore = {
    sessionActive : false,

    totalCurrentWorkTimeString : "0s",
    totalWorkTimeGoalString : "0m",

    timerCount : 0
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

export const useTaskTodoPageStore_SessionActive = () => useStore( TaskTodoPageStore, store => store.sessionActive)

export default useTaskTodoPageStore