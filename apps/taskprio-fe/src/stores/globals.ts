import { EProjectRole, EWorkspaceRole, TProject, TUserAvailableTaskTodo, TUserSecure, TUserTaskTodoState } from "@repo/taskprio-types/src/index"
import { TTask, TTaskForCardView } from "@repo/taskprio-types/src/index"
import { TTaskboard } from "@repo/taskprio-types/src/index"
import { TTaskSection } from "@repo/taskprio-types/src/index"
import { TWorkspace } from "@repo/taskprio-types/src/index"
import { Store, useStore } from "@tanstack/react-store"

export type TTaskboardSectionDrag = {
    taskboardSection : TTaskSection | null
}

export type TTaskboardTaskDrag = {
    taskboardTask : TTaskForCardView | null
}

export type TTaskboardTaskTodoDrag = {
    taskboardTaskTodo : TUserTaskTodoState | TUserAvailableTaskTodo | null
}

export type TGlobalsStore = {
    authenticated : boolean,
    user : TUserSecure | null,
    workspaceRole : EWorkspaceRole | null,
    projectRole : EProjectRole | null,

    invitationRecipient : TUserSecure | null,

    selectedWorkspace : TWorkspace | null,
    selectedProject : TProject | null,   
    selectedTaskboard : TTaskboard | null,
    selectedTask : TTask | null,

    projectsIsLoading : boolean,
    noProjects : boolean,

    taskboardSectionDrag : TTaskboardSectionDrag,
    taskboardTaskDrag : TTaskboardTaskDrag,

    taskboardTaskTodoDrag : TTaskboardTaskTodoDrag,

    taskTodoPageShowAvailableTasks : boolean
}

const initialState : TGlobalsStore = {
    authenticated : false,
    user : null,
    workspaceRole : null,
    projectRole : null,

    invitationRecipient : null,

    selectedWorkspace : null,
    selectedProject : null,
    selectedTaskboard : null,
    selectedTask : null,

    projectsIsLoading : false,
    noProjects : false,

    taskboardSectionDrag : {
        taskboardSection : null
    },
    taskboardTaskDrag : {
        taskboardTask : null
    },
    taskboardTaskTodoDrag : {
        taskboardTaskTodo : null
    },

    taskTodoPageShowAvailableTasks : false
}

const GlobalsStore = new Store<TGlobalsStore>(initialState)

export const updateGlobalsStore = ( store : Partial<TGlobalsStore> ) => {
    GlobalsStore.setState( (prev) => ({
        ...prev,
        ...store
    }) )
}

export const resetGlobalsStore = () => {
    GlobalsStore.setState( () => (initialState) )
}

export const useGlobalsStore = () => {
    return useStore(GlobalsStore)
}

export default GlobalsStore