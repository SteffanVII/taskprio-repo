import { Store, useStore } from "@tanstack/react-store"
import { TTaskForCardView, TTaskSection, TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types"

export enum ETaskTodoPageDragType {
    TODO = "todo",
    AVAILABLE = "available"
}

export type TTaskboardSectionDrag = {
    taskboardSection: TTaskSection | null
}

export type TTaskboardTaskDrag = {
    taskboardTask: TTaskForCardView | null
}

export type TTaskboardTaskTodoDrag = {
    taskboardTaskTodo: TUserTaskTodoState | TUserAvailableTaskTodo | null,
    type: ETaskTodoPageDragType
}

export type TTaskboardDragStore = {
    taskboardSectionDrag: TTaskboardSectionDrag,
    taskboardTaskDrag: TTaskboardTaskDrag,
    taskboardTaskTodoDrag: TTaskboardTaskTodoDrag
}

const initialTaskboardDragStoreState: TTaskboardDragStore = {
    taskboardSectionDrag: {
        taskboardSection: null
    },
    taskboardTaskDrag: {
        taskboardTask: null
    },
    taskboardTaskTodoDrag: {
        taskboardTaskTodo: null,
        type: ETaskTodoPageDragType.TODO
    }
}

const TaskboardDragStore = new Store<TTaskboardDragStore>(initialTaskboardDragStoreState)

export const updateTaskboardDragStore = (store: Partial<TTaskboardDragStore>) => {
    TaskboardDragStore.setState(prev => ({
        ...prev,
        ...store
    }))
}

export const resetTaskboardDragStore = () => {
    TaskboardDragStore.setState(() => (initialTaskboardDragStoreState))
}

export const useTaskboardDragStore = () => {
    return useStore(TaskboardDragStore)
}

export const useTaskboardDragStore_taskboardSectionDrag = () => {
    return useStore(TaskboardDragStore, store => store.taskboardSectionDrag)
}

export const useTaskboardDragStore_taskboardTaskDrag = () => {
    return useStore(TaskboardDragStore, store => store.taskboardTaskDrag)
}

export const useTaskboardDragStore_taskboardTaskTodoDrag = () => {
    return useStore(TaskboardDragStore, store => store.taskboardTaskTodoDrag)
}

export default TaskboardDragStore
