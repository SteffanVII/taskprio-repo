import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDialogsStore, useDialogsStore_renameTaskboardDialog } from "@/stores/dialogs";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const renameTaskboardFormSchema = z.object({
  taskboard_name: z.string().min(1, "Taskboard name is required")
})

const RenameTaskboardDialog = () => {

  const {
    open,
    taskboard
  } = useDialogsStore_renameTaskboardDialog()
  const setRenameTaskboardDialog = useDialogsStore(state => state.setRenameTaskboardDialog)

  const form = useForm<z.infer<typeof renameTaskboardFormSchema>>({
    resolver: zodResolver(renameTaskboardFormSchema)
  })

  const onSubmit = async (data: z.infer<typeof renameTaskboardFormSchema>) => {
    console.log(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setRenameTaskboardDialog(taskboard, !open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Taskboard</DialogTitle>
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
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Type the new taskboard name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default RenameTaskboardDialog;