import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateTaskboard } from "@/services/private/taskboard/mutation";
import { updateDialogsStore, useDialogsStore_createTaskboardDialog } from "@/stores/dialogs";

import { useProjectStore_selectedProject } from "@/stores/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";

const createTaskboardFormSchema = z.object({
    taskboard_name: z.string().min(1, "Taskboard name is required")
})

const CreateTaskboardDialog = () => {

    const selectedProject = useProjectStore_selectedProject()

    const {
        open
    } = useDialogsStore_createTaskboardDialog()

    const form = useForm<z.infer<typeof createTaskboardFormSchema>>({
        resolver: zodResolver(createTaskboardFormSchema),
        defaultValues: {
            taskboard_name: ""
        }
    })

    const title = form.watch("taskboard_name")

    const {
        mutateAsync: createTaskboardTrigger,
        isPending: createTaskboardIsPending
    } = useCreateTaskboard({
        onSuccess: () => {
            updateDialogsStore({
                createTaskboardDialog: {
                    open: false
                }
            })
            form.reset()
        }
    })

    const onSubmit = async (value: z.infer<typeof createTaskboardFormSchema>) => {
        if (selectedProject) {
            await createTaskboardTrigger({
                project_id: selectedProject.project_id,
                taskboard_name: value.taskboard_name
            })
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                updateDialogsStore({
                    createTaskboardDialog: {
                        open: !open
                    }
                })
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Taskboard</DialogTitle>
                </DialogHeader>
                <Form
                    {...form}
                >
                    <form>
                        <FormField
                            control={form.control}
                            name="taskboard_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name of your new taskboard.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button
                        disabled={title.length < 1 || createTaskboardIsPending}
                        onClick={() => {
                            form.handleSubmit(onSubmit)()
                        }}
                    >
                        {createTaskboardIsPending ? <Spinner /> : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTaskboardDialog;