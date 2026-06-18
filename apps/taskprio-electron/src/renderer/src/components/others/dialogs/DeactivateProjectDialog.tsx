import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDialogsStore, useDialogsStore_deactivateProjectDialog } from "@/stores/dialogs";
import { useDeactivateProject } from "@/services/private/project/mutation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { toast } from "sonner";
import Spinner from "../Spinner";

const DeactivateProjectDialog = () => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const setDeactivateProjectDialog = useDialogsStore(state => state.setDeactivateProjectDialog)

  const {
    open,
    project
  } = useDialogsStore_deactivateProjectDialog()

  const deactivateProjectFormSchema = z.object({
    project_name: z.string().min(1, "Name of the project is required")
      .refine(value => {
        return value === project?.project_name
      }, { message: `You must type "${project?.project_name}" to confirm deactivation.` })
  })

  const form = useForm<z.infer<typeof deactivateProjectFormSchema>>({
    resolver: zodResolver(deactivateProjectFormSchema)
  })

  const {
    mutateAsync: deactivateProjectTrigger,
    isPending: deactivateProjectIsPending
  } = useDeactivateProject({
    onSuccess: () => {
      toast.success(`Project ${project?.project_name} is successfully deactivated.`)
      setDeactivateProjectDialog(project, false)
    }
  })

  const onSubmit = async () => {
    if (!project || !selectedWorkspace) return;

    await deactivateProjectTrigger({
      project_id: project.project_id,
      workspace_id: selectedWorkspace.workspace_id
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        if (!openValue) {
          form.reset()
        }
        if (!deactivateProjectIsPending) {
          setDeactivateProjectDialog(project, !open)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Project</DialogTitle>
          <DialogDescription>Are you sure you want to deactivate this project? You can still reactivate it anytime.</DialogDescription>
        </DialogHeader>
        <Form
          {...form}
        >
          <form>
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem
                  className="w-full"
                >
                  <FormControl>
                    <Input
                      placeholder="Project Name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Please input the name of the project "<span className="font-bold" >{project?.project_name}</span>" to confirm</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            >
            </FormField>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant={'destructive'}
            onClick={() => {
              form.handleSubmit(onSubmit)()
            }}
            disabled={deactivateProjectIsPending}
          >
            {deactivateProjectIsPending ? <Spinner /> : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default DeactivateProjectDialog;

