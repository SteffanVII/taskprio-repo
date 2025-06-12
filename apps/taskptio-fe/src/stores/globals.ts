import { TProject } from "@/services/private/project/types"
import { TTask } from "@/services/private/task/types"
import { TTaskboard } from "@/services/private/taskboard/types"
import { TTaskSection } from "@/services/private/tasksection/types"
import { TWorkspace } from "@/services/private/workspace/types"
import { Store, useStore } from "@tanstack/react-store"

export type TTaskboardSectionDrag = {
    taskboardSection : TTaskSection | null
}

export type TTaskboardTaskDrag = {
    taskboardTask : TTask | null
}

export type TGlobalsStore = {
    authenticated : boolean,

    selectedWorkspace : TWorkspace | null,
    selectedProject : TProject | null,   
    selectedTaskboard : TTaskboard | null,
    selectedTask : TTask | null,

    projectsIsLoading : boolean,
    noProjects : boolean,

    taskboardSectionDrag : TTaskboardSectionDrag,
    taskboardTaskDrag : TTaskboardTaskDrag
}

const GlobalsStore = new Store<TGlobalsStore>({
    authenticated : false,

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
    }
})

export const updateGlobalsStore = ( store : Partial<TGlobalsStore> ) => {
    GlobalsStore.setState( (prev) => ({
        ...prev,
        ...store
    }) )
}

export const resetGlobalsStore = () => {
    GlobalsStore.setState( () => ({
        authenticated : false,
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
        }
    }) )
}

export const useGlobalsStore = () => {
    return useStore(GlobalsStore)
}

export default GlobalsStore