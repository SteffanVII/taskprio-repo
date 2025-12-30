import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactivateTaskboard } from "@/services/private/taskboard/mutation";
import { updateDialogsStore, useDialogsStore_reactivateTaskboardDialog } from "@/stores/dialogs";
import Spinner from "../Spinner";

const ReactivateTaskboardDialog = () => {

    const {
        open,
        taskboard
    } = useDialogsStore_reactivateTaskboardDialog()

    const {
        mutateAsync : reactivateTaskboardTrigger,
        isPending : reactivateTaskboardIsPending
    } = useReactivateTaskboard({
        onSuccess : () => {
            updateDialogsStore({
                reactivateTaskboardDialog : {
                    open : false,
                    taskboard
                }
            })            
        }
    })

    const handleReactivateTaskboard = () => {
        if ( taskboard ) {
            reactivateTaskboardTrigger({
                project_id : taskboard.project_id,
                taskboard_id : taskboard.task_board_id
            })
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={ () => {
                if ( !reactivateTaskboardIsPending ) {
                    updateDialogsStore({
                        reactivateTaskboardDialog : {
                            open : !open,
                            taskboard
                        }
                    })
                }
            } }
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reactivate Taskboard</DialogTitle>
                    <DialogDescription>Are you sure you want to reactivate <span className="font-bold" >{taskboard?.task_board_name}</span> taskboard?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={handleReactivateTaskboard}
                        disabled={reactivateTaskboardIsPending}
                    >
                        {reactivateTaskboardIsPending ? <Spinner/> : "Yes, I'm sure"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default ReactivateTaskboardDialog;