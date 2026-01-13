import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useFinishTaskTodoSession } from "@/services/private/todo/mutation";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";

import React from "react";
import Spinner from "../Spinner";

type TTaskTodoFinishSessionDialogProps = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
}

const TaskTodoFinishSessionDialog: React.FC<TTaskTodoFinishSessionDialogProps> = ({
    open,
    onOpenChange,
}) => {

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const {
        mutateAsync: finishTaskTodoSessionTrigger,
        isPending: finishTaskTodoSessionPending
    } = useFinishTaskTodoSession({
        onSuccess: () => {
            onOpenChange(false)
        }
    })

    const handleFinishSessionConfirmation = async () => {
        await finishTaskTodoSessionTrigger({
            pathParameters: {
                workspace_id: selectedWorkspace!.workspace_id
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!finishTaskTodoSessionPending) {
                    onOpenChange(open)
                }
            }}
        >
            <DialogContent>
                <DialogTitle>Finish Session</DialogTitle>
                <DialogDescription>
                    Are you sure you want to finish the session? Finishing the session will log the current work time you have tracked on the tasks and reset the current work time to 0.
                </DialogDescription>
                <DialogFooter>
                    <Button
                        variant={"destructive"}
                        onClick={() => onOpenChange(false)}
                        disabled={finishTaskTodoSessionPending}
                    >Cancel</Button>
                    <Button
                        onClick={handleFinishSessionConfirmation}
                        disabled={finishTaskTodoSessionPending}
                    >
                        {finishTaskTodoSessionPending ? <Spinner /> : "Yes, I'm sure."}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default TaskTodoFinishSessionDialog;