import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDialogsStore, useDialogsStore_taskAssignerDialog } from "@/stores/dialogs";

const TaskboardTaskAssignerDialog = () => {

  const {
    open,
    task
  } = useDialogsStore_taskAssignerDialog()
  const setTaskAssignerDialog = useDialogsStore(state => state.setTaskAssignerDialog)

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setTaskAssignerDialog(task, !open)
      }}
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