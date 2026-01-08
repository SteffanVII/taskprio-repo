import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/services/private/project/mutation";
import { updateDialogsStore, useDialogsStore_createProjectDialog } from "@/stores/dialogs";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import Spinner from "../Spinner";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const formSchema = z.object({
    projectName: z.string().min(1, "Project Name is required"),
    projectCode: z.string().optional()
})

const CreateProjectDialog = () => {

    const {
        open
    } = useDialogsStore_createProjectDialog()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
            projectCode: ""
        }
    })

    const {
        mutateAsync: createProject,
        isPending: isCreatingProject
    } = useCreateProject(() => {
        updateDialogsStore({
            createProjectDialog: {
                open: false
            }
        })
        form.reset()
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!selectedWorkspace) return
        await createProject({
            body: {
                project_name: values.projectName,
                workspace_id: selectedWorkspace.workspace_id
            }
        })
    }

    useEffect(() => {
        if (open) {
            form.reset()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={() => {
            updateDialogsStore({
                createProjectDialog: {
                    open: !open
                }
            })
        }}>
            <DialogContent>
                <DialogTitle>Create Project</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" >
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Name"
                                            {...field}
                                            disabled={isCreatingProject}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is your public display name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="projectCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Code (Optional)"
                                            {...field}
                                            disabled={isCreatingProject}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This code will be used as a prefix for tasks. You can update this later.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                variant={"outline"}
                                type="submit"
                                disabled={isCreatingProject}
                            >
                                {isCreatingProject ? <Spinner /> : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

}

export default CreateProjectDialog;