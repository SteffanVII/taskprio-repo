import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDeactivateTaskboard } from "@/services/private/taskboard/mutation";
import { useDialogsStore, useDialogsStore_deactivateTaskboardDialog } from "@/stores/dialogs";

import { useProjectStore_selectedProject } from "@/stores/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import Spinner from "../Spinner";

const DeactivateTaskboardDialog = () => {

  const {
    open,
    taskboard
  } = useDialogsStore_deactivateTaskboardDialog()

  const selectedProject = useProjectStore_selectedProject()
  const setDeactivateTaskboardDialog = useDialogsStore(state => state.setDeactivateTaskboardDialog)

  const {
    mutateAsync: deactivateTaskboardTrigger,
    isPending: deactiveTaskboardIsPending
  } = useDeactivateTaskboard({
    onSuccess: () => {
      setDeactivateTaskboardDialog(taskboard, false)
    }
  })

  const deactivateTaskboardFormSchema = z.object({
    taskboard_name: z.string().min(1, "Name of the taskboard is required")
      .refine(value => {
        return value === taskboard?.task_board_name
      }, { message: `You must type "${taskboard?.task_board_name}" to confirm deletion.` })
  })

  const form = useForm<z.infer<typeof deactivateTaskboardFormSchema>>({
    resolver: zodResolver(deactivateTaskboardFormSchema)
  })

  const onSubmit = async () => {
    deactivateTaskboardTrigger({
      taskboard_id: taskboard!.task_board_id,
      project_id: selectedProject!.project_id
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue) => {
        if (!openValue) {
          form.reset()
        }
        if (!deactiveTaskboardIsPending) {
          setDeactivateTaskboardDialog(taskboard, !open)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Taskboard</DialogTitle>
          <DialogDescription>Are you sure you want to deactive this taskboard? You can still reactivate anytime you want.</DialogDescription>
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
            variant={'destructive'}
            onClick={() => {
              form.handleSubmit(onSubmit)()
            }}
            disabled={deactiveTaskboardIsPending}
          >
            {deactiveTaskboardIsPending ? <Spinner /> : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default DeactivateTaskboardDialog;