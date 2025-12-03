import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateDialogsStore, useDialogsStore_taskAssignerDialog } from "@/stores/dialogs";


const TaskboardTaskAssignerDialog = () => {

    const {
        open,
        task
    } = useDialogsStore_taskAssignerDialog()

    return (
        <Dialog
            open={open}
            onOpenChange={ () => {
                updateDialogsStore({
                    taskAssignerDialog : {
                        open : !open,
                        task
                    }
                })
            } }
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Task Assigner</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )

}

export default TaskboardTaskAssignerDialog;