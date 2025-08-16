import { TTag } from "@repo/taskprio-types/src";
import { Store, useStore } from "@tanstack/react-store";

export type TDialogStore = {
    createProjectDialog : {
        open : boolean
    },
    createWorkspaceDialog : {
        open : boolean
    },
    workspaceInvitationDialog : {
        open : boolean
    },
    tagDialog : {
        open : boolean,
        tag : TTag | null
    }
}

const DialogsStore = new Store<TDialogStore>({
    createProjectDialog : {
        open : false
    },
    createWorkspaceDialog : {
        open : false
    },
    workspaceInvitationDialog : {
        open : false
    },
    tagDialog : {
        open : false,
        tag : null
    }
})

export const updateDialogsStore = (store : Partial<TDialogStore>) => {
    DialogsStore.setState( (prev) => ({
        ...prev,
        ...store
    }))
}

export const useDialogsStore = () => {
    return useStore(DialogsStore);
}

export default DialogsStore;