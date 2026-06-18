import { TTaskForCardView, TTaskSection, TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types"
import { create } from "zustand"

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

export type TTaskboardDragStoreValues = {
    taskboardSectionDrag: TTaskboardSectionDrag,
    taskboardTaskDrag: TTaskboardTaskDrag,
    taskboardTaskTodoDrag: TTaskboardTaskTodoDrag
}

export type TTaskboardDragStoreActions = {
  updateTaskboardSectionDrag: (taskboardSection: TTaskSection | null) => void,
  updateTaskboardTaskDrag: (taskboardTask: TTaskForCardView | null) => void,
  updateTaskboardTaskTodoDrag: (taskboardTaskTodo: TUserTaskTodoState | TUserAvailableTaskTodo | null, type: ETaskTodoPageDragType) => void,
  resetStore: () => void
}

export type TTaskboardDragStore = TTaskboardDragStoreValues & TTaskboardDragStoreActions

const initialTaskboardDragStoreState: TTaskboardDragStoreValues = {
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

export const useTaskboardDragStore = create<TTaskboardDragStore>(set => ({
  ...initialTaskboardDragStoreState,
  updateTaskboardSectionDrag: (taskboardSection: TTaskSection | null) => set((state) => ({
    taskboardSectionDrag: {
      ...state.taskboardSectionDrag,
      taskboardSection
    }
  })),
  updateTaskboardTaskDrag: (taskboardTask: TTaskForCardView | null) => set((state) => ({
    taskboardTaskDrag: {
      ...state.taskboardTaskDrag,
      taskboardTask
    }
  })),
  updateTaskboardTaskTodoDrag: (taskboardTaskTodo: TUserTaskTodoState | TUserAvailableTaskTodo | null, type: ETaskTodoPageDragType) => set((state) => ({
    taskboardTaskTodoDrag: {
      ...state.taskboardTaskTodoDrag,
      taskboardTaskTodo,
      type
    }
  })),
  resetStore: () => set({...initialTaskboardDragStoreState})
}))

export const useTaskboardDragStore_taskboardSectionDrag = () => {
    return useTaskboardDragStore(state => state.taskboardSectionDrag)
}

export const useTaskboardDragStore_taskboardTaskDrag = () => {
    return useTaskboardDragStore(state => state.taskboardTaskDrag)
}

export const useTaskboardDragStore_taskboardTaskTodoDrag = () => {
    return useTaskboardDragStore(state => state.taskboardTaskTodoDrag)
}