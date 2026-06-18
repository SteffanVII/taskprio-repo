import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDropProject } from "@/services/private/project/mutation";
import { useDialogsStore, useDialogsStore_dropProjectDialog } from "@/stores/dialogs";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import { useNavigate } from "@tanstack/react-router";

const DropProjectDialog = () => {

  const navigate = useNavigate();

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const setDropProjectDialog = useDialogsStore(state => state.setDropProjectDialog)

  const {
    open,
    project
  } = useDialogsStore_dropProjectDialog()

  const {
    mutateAsync: dropProjectTrigger,
    isPending: dropProjectIsPending
  } = useDropProject({
    onSuccess: () => {
      setDropProjectDialog(null, false)
      navigate({
        to: "/workspace/$workspace_id/project",
        params: {
          workspace_id: selectedWorkspace!.workspace_id
        }
      })
      form.reset()
    }
  })

  const dropProjectFormSchema = z.object({
    project_name: z.string().min(1, "Name of the project is required")
      .refine(value => {
        return value === project?.project_name
      }, { message: `You must type "${project?.project_name}" to confirm deletion.` })
  })

  const form = useForm<z.infer<typeof dropProjectFormSchema>>({
    resolver: zodResolver(dropProjectFormSchema)
  })

  const onSubmit = async (data: z.infer<typeof dropProjectFormSchema>) => {
    if (!project || !selectedWorkspace) return;

    await dropProjectTrigger({
      project_id: project.project_id,
      workspace_id: selectedWorkspace.workspace_id,
      project_name: data.project_name
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        if (!openValue) {
          form.reset()
        }
        if (!dropProjectIsPending) {
          setDropProjectDialog(project, !open)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Drop Project</DialogTitle>
          <DialogDescription>Are you sure you want to drop this project? The data will be lost forever.</DialogDescription>
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
            variant={"destructive"}
            onClick={form.handleSubmit(onSubmit)}
            disabled={dropProjectIsPending}
          >
            {dropProjectIsPending ? <Spinner /> : "Drop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default DropProjectDialog;