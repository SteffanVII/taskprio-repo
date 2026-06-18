import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReactivateProject } from "@/services/private/project/mutation";
import { useDialogsStore, useDialogsStore_reactivateProjectDialog } from "@/stores/dialogs";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { toast } from "sonner";
import Spinner from "../Spinner";

const ReactivateProjectDialog = () => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

  const {
    open,
    project
  } = useDialogsStore_reactivateProjectDialog()
  const setReactivateProjectDialog = useDialogsStore(state => state.setReactivateProjectDialog)

  const {
    mutateAsync: reactivateProjectTrigger,
    isPending: reactivateProjectIsPending
  } = useReactivateProject({
    onSuccess: () => {
      toast.success(`Project ${project?.project_name} is successfully reactivated.`)
      setReactivateProjectDialog(null, false);
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
          setReactivateProjectDialog(project, !open);
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
            disabled={reactivateProjectIsPending}
          >
            {reactivateProjectIsPending ? <Spinner /> : "Yes, I'm sure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReactivateProjectDialog;

