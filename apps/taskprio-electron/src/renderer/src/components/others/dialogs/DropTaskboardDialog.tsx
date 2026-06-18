import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDropTaskboard } from "@/services/private/taskboard/mutation";
import { useDialogsStore, useDialogsStore_dropTaskboardDialog } from "@/stores/dialogs";

import { useProjectStore_selectedProject } from "@/stores/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import { useNavigate, useParams } from "@tanstack/react-router";

const DropTaskboardDialog = () => {

  const navigate = useNavigate()

  const { workspace_id, project_id } = useParams({ strict: false })
  const selectedProject = useProjectStore_selectedProject()
  const setDropTaskboardDialog = useDialogsStore(state => state.setDropTaskboardDialog)

  const {
    open,
    taskboard
  } = useDialogsStore_dropTaskboardDialog()

  const {
    mutateAsync: dropTaskboardTrigger,
    isPending: dropTaskboardIsPending
  } = useDropTaskboard({
    onSuccess: () => {
      setDropTaskboardDialog(null, false)
      navigate({
        to: "/workspace/$workspace_id/project/$project_id",
        params: {
          workspace_id: workspace_id!,
          project_id: project_id!
        }
      })
      form.reset()
    }
  })

  const dropTaskboardFormSchema = z.object({
    taskboard_name: z.string().min(1, "Name of the taskboard is required")
      .refine(value => {
        return value === taskboard?.task_board_name
      }, { message: `You must type "${taskboard?.task_board_name}" to confirm deletion.` })
  })

  const form = useForm<z.infer<typeof dropTaskboardFormSchema>>({
    resolver: zodResolver(dropTaskboardFormSchema)
  })

  const onSubmit = async (data: z.infer<typeof dropTaskboardFormSchema>) => {
    dropTaskboardTrigger({
      taskboard_id: taskboard!.task_board_id,
      project_id: selectedProject!.project_id,
      taskboard_name_confirmation: data.taskboard_name
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        if (!openValue) {
          form.reset()
        }
        if (!dropTaskboardIsPending) {
          setDropTaskboardDialog(taskboard, !open)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Drop Taskboard</DialogTitle>
          <DialogDescription>Are you sure you want to drop this taskboard? The data will be lost forever. We Suggest to deactivate the taskboard instead if you are not sure.</DialogDescription>
        </DialogHeader>
        <Form
          {...form}
        >
          <form>
            <FormField
              control={form.control}
              name="taskboard_name"
              render={({ field }) => (
                <FormItem
                  className="w-full"
                >
                  <FormControl>
                    <Input
                      placeholder="Taskboard Name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Please input the name of the taskboard "<span className="font-bold" >{taskboard?.task_board_name}</span>" to confirm</FormDescription>
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
            disabled={dropTaskboardIsPending}
          >
            {dropTaskboardIsPending ? <Spinner /> : "Drop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default DropTaskboardDialog;