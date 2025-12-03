import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactivateProject } from "@/services/private/project/mutation";
import { updateDialogsStore, useDialogsStore_reactivateProjectDialog } from "@/stores/dialogs";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { toast } from "sonner";

const ReactivateProjectDialog = () => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const {
        open,
        project
    } = useDialogsStore_reactivateProjectDialog()

    const {
        mutateAsync: reactivateProjectTrigger,
        isPending: reactivateProjectIsPending
    } = useReactivateProject({
        onSuccess: () => {
            toast.success( `Project ${project?.project_name} is successfully reactivated.` )
            updateDialogsStore({
                reactivateProjectDialog: {
                    open: false,
                    project
                }
            });
        }
    });
    
    const handleReactivateProject = () => {
        if (project && selectedWorkspace) {
            reactivateProjectTrigger({
                project_id: project.project_id,
                workspace_id: selectedWorkspace.workspace_id
            });
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                if (!reactivateProjectIsPending) {
                    updateDialogsStore({
                        reactivateProjectDialog: {
                            open: !open,
                            project
                        }
                    });
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reactivate Project</DialogTitle>
                    <DialogDescription>Are you sure you want to reactivate <span className="font-bold" >{project?.project_name}</span> project?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={handleReactivateProject}
                        isLoading={reactivateProjectIsPending}
                    >
                        Yes, I'm sure
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ReactivateProjectDialog;

