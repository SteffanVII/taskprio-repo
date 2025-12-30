import { TProject, TProjectInactiveForTable, TTag, TTaskboard, TTaskboardInactiveForTable, TTaskForCardView } from "@repo/taskprio-types/src";
import { Store, useStore } from "@tanstack/react-store";

export type TDialogStore = {
    createProjectDialog: {
        open: boolean
    },
    createTaskboardDialog: {
        open: boolean
    },
    createWorkspaceDialog: {
        open: boolean
    },
    renameTaskboardDialog: {
        open: boolean,
        taskboard: TTaskboard | null
    },
    dropTaskboardDialog: {
        open: boolean,
        taskboard: TTaskboard | null
    },
    deactivateTaskboardDialog: {
        open: boolean,
        taskboard: TTaskboard | null
    },
    reactivateTaskboardDialog: {
        open: boolean,
        taskboard: TTaskboardInactiveForTable | null
    },
    dropProjectDialog: {
        open: boolean,
        project: TProject | TProjectInactiveForTable | null
    },
    deactivateProjectDialog: {
        open: boolean,
        project: TProject | null
    },
    reactivateProjectDialog: {
        open: boolean,
        project: TProjectInactiveForTable | null
    },
    workspaceInvitationDialog: {
        open: boolean
    },
    tagDialog: {
        open: boolean,
        tag: TTag | null
    },
    taskAssignerDialog: {
        open: boolean,
        task: TTaskForCardView | null
    },
    taskboardTaskTrashSheet: {
        open: boolean
    },
    overlayModePreferencesDialog: {
        open: boolean
    },
    acceptInvitationDialog: {
        open: boolean,
        token: string | null
    }
}

const initialState: TDialogStore = {
    createProjectDialog: {
        open: false
    },
    createTaskboardDialog: {
        open: false
    },
    createWorkspaceDialog: {
        open: false
    },
    renameTaskboardDialog: {
        open: false,
        taskboard: null
    },
    dropTaskboardDialog: {
        open: false,
        taskboard: null
    },
    deactivateTaskboardDialog: {
        open: false,
        taskboard: null
    },
    reactivateTaskboardDialog: {
        open: false,
        taskboard: null
    },
    dropProjectDialog: {
        open: false,
        project: null
    },
    deactivateProjectDialog: {
        open: false,
        project: null
    },
    reactivateProjectDialog: {
        open: false,
        project: null
    },
    workspaceInvitationDialog: {
        open: false
    },
    tagDialog: {
        open: false,
        tag: null
    },
    taskAssignerDialog: {
        open: false,
        task: null
    },
    taskboardTaskTrashSheet: {
        open: false
    },
    overlayModePreferencesDialog: {
        open: false
    },
    acceptInvitationDialog: {
        open: false,
        token: null
    }
}

const DialogsStore = new Store<TDialogStore>(initialState)

export const updateDialogsStore = (store: Partial<TDialogStore>) => {
    DialogsStore.setState((prev) => ({
        ...prev,
        ...store
    }))
}

export const useDialogsStore = () => {
    return useStore(DialogsStore);
}

export const resetDialogsStore = () => {
    DialogsStore.setState(initialState)
}

export const useDialogsStore_createProjectDialog = () => {
    return useStore(DialogsStore, store => store.createProjectDialog)
}

export const useDialogsStore_createTaskboardDialog = () => {
    return useStore(DialogsStore, store => store.createTaskboardDialog)
}

export const useDialogsStore_createWorkspaceDialog = () => {
    return useStore(DialogsStore, store => store.createWorkspaceDialog)
}

export const useDialogsStore_renameTaskboardDialog = () => {
    return useStore(DialogsStore, store => store.renameTaskboardDialog)
}

export const useDialogsStore_dropTaskboardDialog = () => {
    return useStore(DialogsStore, store => store.dropTaskboardDialog)
}

export const useDialogsStore_deactivateTaskboardDialog = () => {
    return useStore(DialogsStore, store => store.deactivateTaskboardDialog)
}

export const useDialogsStore_reactivateTaskboardDialog = () => {
    return useStore(DialogsStore, store => store.reactivateTaskboardDialog)
}

export const useDialogsStore_dropProjectDialog = () => {
    return useStore(DialogsStore, store => store.dropProjectDialog)
}

export const useDialogsStore_deactivateProjectDialog = () => {
    return useStore(DialogsStore, store => store.deactivateProjectDialog)
}

export const useDialogsStore_reactivateProjectDialog = () => {
    return useStore(DialogsStore, store => store.reactivateProjectDialog)
}

export const useDialogsStore_workspaceInvitationDialog = () => {
    return useStore(DialogsStore, store => store.workspaceInvitationDialog)
}

export const useDialogsStore_tagDialog = () => {
    return useStore(DialogsStore, store => store.tagDialog)
}

export const useDialogsStore_taskAssignerDialog = () => {
    return useStore(DialogsStore, store => store.taskAssignerDialog)
}

export const useDialogsStore_taskboardTaskTrashSheet = () => {
    return useStore(DialogsStore, store => store.taskboardTaskTrashSheet)
}

export const useDialogsStore_overlayModePreferencesDialog = () => useStore(DialogsStore, store => store.overlayModePreferencesDialog)
export const useDialogsStore_acceptInvitationDialog = () => useStore(DialogsStore, store => store.acceptInvitationDialog)

export default DialogsStore;