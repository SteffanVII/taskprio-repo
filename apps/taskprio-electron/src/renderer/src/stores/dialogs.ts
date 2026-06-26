import { TProject, TProjectInactiveForTable, TTag, TTaskboard, TTaskboardInactiveForTable, TTaskForCardView } from "@repo/taskprio-types";
import { create } from "zustand";

export type TDropProjectFrom = "PROJECT" | "WORKSPACE_SETTINGS"
export type TDropTaskboardFrom = "TASKBOARD" | "PROJECT_SETTINGS"

export type TDialogStoreValues = {
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
    from: TDropTaskboardFrom
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
    from: TDropProjectFrom
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
  },
  profileDialog: {
    open: boolean
  }
}

type TDialogsStoreActions = {
  setCreateProjectDialog: (open: boolean) => void,
  setCreateTaskboardDialog: (open: boolean) => void,
  setCreateWorkspaceDialog: (open: boolean) => void,
  setRenameTaskboardDialog: (taskboard: TTaskboard | null, open: boolean) => void,
  setDropTaskboardDialog: (open: boolean, taskboard: TTaskboard | null, from? : TDropTaskboardFrom) => void,
  setDeactivateTaskboardDialog: (taskboard: TTaskboard | null, open: boolean) => void,
  setReactivateTaskboardDialog: (taskboard: TTaskboardInactiveForTable | null, open: boolean) => void,
  setDropProjectDialog: (open: boolean, project: TProject | TProjectInactiveForTable | null, from?: TDropProjectFrom) => void,
  setDeactivateProjectDialog: (project: TProject | null, open: boolean) => void,
  setReactivateProjectDialog: (project: TProjectInactiveForTable | null, open: boolean) => void,
  setWorkspaceInvitationDialog: (open: boolean) => void,
  setTagDialog: (tag: TTag | null, open: boolean) => void,
  setTaskAssignerDialog: (task: TTaskForCardView | null, open: boolean) => void,
  setTaskboardTaskTrashSheet: (open: boolean) => void,
  setOverlayModePreferencesDialog: (open: boolean) => void,
  setAcceptInvitationDialog: (token: string | null, open: boolean) => void,
  setProfileDialog: (open : boolean) => void,
  resetDialogsStore: () => void
}

export type TDialogsStore = TDialogStoreValues & TDialogsStoreActions

const initialState: TDialogStoreValues = {
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
    taskboard: null,
    from: "TASKBOARD"
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
    from: "PROJECT",
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
  },
  profileDialog: {
    open: false
  }
}

export const useDialogsStore = create<TDialogsStore>((set) => ({
  ...initialState,
  setCreateProjectDialog: (open: boolean) => set((state) => ({
    createProjectDialog: {
      ...state.createProjectDialog,
      open
    }
  })),
  setCreateTaskboardDialog: (open: boolean) => set((state) => ({
    createTaskboardDialog: {
      ...state.createTaskboardDialog,
      open
    }
  })),
  setCreateWorkspaceDialog: (open: boolean) => set((state) => ({
    createWorkspaceDialog: {
      ...state.createWorkspaceDialog,
      open
    }
  })),
  setRenameTaskboardDialog: (taskboard: TTaskboard | null, open: boolean) => set((state) => ({
    renameTaskboardDialog: {
      ...state.renameTaskboardDialog,
      taskboard,
      open
    }
  })),
  setDropTaskboardDialog: (open: boolean, taskboard: TTaskboard | null, from : TDropTaskboardFrom | undefined = "TASKBOARD" ) => set((state) => ({
    dropTaskboardDialog: {
      ...state.dropTaskboardDialog,
      taskboard,
      from,
      open
    }
  })),
  setDeactivateTaskboardDialog: (taskboard: TTaskboard | null, open: boolean) => set((state) => ({
    deactivateTaskboardDialog: {
      ...state.deactivateTaskboardDialog,
      taskboard,
      open
    }
  })),
  setReactivateTaskboardDialog: (taskboard: TTaskboardInactiveForTable | null, open: boolean) => set((state) => ({
    reactivateTaskboardDialog: {
      ...state.reactivateTaskboardDialog,
      taskboard,
      open
    }
  })),
  setDropProjectDialog: (open: boolean, project: TProject | TProjectInactiveForTable | null, from: TDropProjectFrom | undefined = "PROJECT") => set((state) => ({
    dropProjectDialog: {
      ...state.dropProjectDialog,
      project,
      from,
      open
    }
  })),
  setDeactivateProjectDialog: (project: TProject | null, open: boolean) => set((state) => ({
    deactivateProjectDialog: {
      ...state.deactivateProjectDialog,
      project,
      open
    }
  })),
  setReactivateProjectDialog: (project: TProjectInactiveForTable | null, open: boolean) => set((state) => ({
    reactivateProjectDialog: {
      ...state.reactivateProjectDialog,
      project,
      open
    }
  })),
  setWorkspaceInvitationDialog: (open: boolean) => set((state) => ({
    workspaceInvitationDialog: {
      ...state.workspaceInvitationDialog,
      open
    }
  })),
  setTagDialog: (tag: TTag | null, open: boolean) => set((state) => ({
    tagDialog: {
      ...state.tagDialog,
      tag,
      open
    }
  })),
  setTaskAssignerDialog: (task: TTaskForCardView | null, open: boolean) => set((state) => ({
    taskAssignerDialog: {
      ...state.taskAssignerDialog,
      task,
      open
    }
  })),
  setTaskboardTaskTrashSheet: (open: boolean) => set((state) => ({
    taskboardTaskTrashSheet: {
      ...state.taskboardTaskTrashSheet,
      open
    }
  })),
  setOverlayModePreferencesDialog: (open: boolean) => set((state) => ({
    overlayModePreferencesDialog: {
      ...state.overlayModePreferencesDialog,
      open
    }
  })),
  setAcceptInvitationDialog: (token: string | null, open: boolean) => set((state) => ({
    acceptInvitationDialog: {
      ...state.acceptInvitationDialog,
      token,
      open
    }
  })),
  setProfileDialog: (open : boolean) => set((state) => ({
    profileDialog: {
      ...state.profileDialog,
      open
    }
  })),
  resetDialogsStore: () => set(initialState)
}))

export const useDialogsStore_createProjectDialog = () => {
  return useDialogsStore(state => state.createProjectDialog)
}

export const useDialogsStore_createTaskboardDialog = () => {
  return useDialogsStore(state => state.createTaskboardDialog)
}

export const useDialogsStore_createWorkspaceDialog = () => {
  return useDialogsStore(state => state.createWorkspaceDialog)
}

export const useDialogsStore_renameTaskboardDialog = () => {
  return useDialogsStore(state => state.renameTaskboardDialog)
}

export const useDialogsStore_dropTaskboardDialog = () => {
  return useDialogsStore(state => state.dropTaskboardDialog)
}

export const useDialogsStore_deactivateTaskboardDialog = () => {
  return useDialogsStore(state => state.deactivateTaskboardDialog)
}

export const useDialogsStore_reactivateTaskboardDialog = () => {
  return useDialogsStore(state => state.reactivateTaskboardDialog)
}

export const useDialogsStore_dropProjectDialog = () => {
  return useDialogsStore(state => state.dropProjectDialog)
}

export const useDialogsStore_deactivateProjectDialog = () => {
  return useDialogsStore(state => state.deactivateProjectDialog)
}

export const useDialogsStore_reactivateProjectDialog = () => {
  return useDialogsStore(state => state.reactivateProjectDialog)
}

export const useDialogsStore_workspaceInvitationDialog = () => {
  return useDialogsStore(state => state.workspaceInvitationDialog)
}

export const useDialogsStore_tagDialog = () => {
  return useDialogsStore(state => state.tagDialog)
}

export const useDialogsStore_taskAssignerDialog = () => {
  return useDialogsStore(state => state.taskAssignerDialog)
}

export const useDialogsStore_taskboardTaskTrashSheet = () => {
  return useDialogsStore(state => state.taskboardTaskTrashSheet)
}

export const useDialogsStore_overlayModePreferencesDialog = () => useDialogsStore(state => state.overlayModePreferencesDialog)
export const useDialogsStore_acceptInvitationDialog = () => useDialogsStore(state => state.acceptInvitationDialog)
export const useDialogsStore_profileDialog = () => useDialogsStore(state => state.profileDialog)