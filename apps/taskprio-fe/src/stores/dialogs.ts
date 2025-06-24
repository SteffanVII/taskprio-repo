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