import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateDialogsStore, useDialogsStore_deactivateProjectDialog } from "@/stores/dialogs";
import { useDeactivateProject } from "@/services/private/project/mutation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { toast } from "sonner";

const DeactivateProjectDialog = () => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const {
        open,
        project
    } = useDialogsStore_deactivateProjectDialog()

    const deactivateProjectFormSchema = z.object({
        project_name : z.string().min( 1, "Name of the project is required" )
            .refine( value => {
                return value === project?.project_name
            }, { message: `You must type "${project?.project_name}" to confirm deactivation.` } )
    })

    const form = useForm<z.infer<typeof deactivateProjectFormSchema>>({
        resolver : zodResolver( deactivateProjectFormSchema )
    })

    const {
        mutateAsync: deactivateProjectTrigger,
        isPending: deactivateProjectIsPending
    } = useDeactivateProject({
        onSuccess: () => {
            toast.success( `Project ${project?.project_name} is successfully deactivated.` )
            updateDialogsStore({
                deactivateProjectDialog: {
                    open: false,
                    project
                }
            })
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
            onOpenChange={ ( openValue ) => {
                if (!openValue) {
                    form.reset()
                }
                if (!deactivateProjectIsPending) {
                    updateDialogsStore({
                        deactivateProjectDialog: {
                            open: !open,
                            project
                        }
                    })
                }
            } }
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
                            render={ ({ field }) => (
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
                        isLoading={deactivateProjectIsPending}
                    >Deactivate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default DeactivateProjectDialog;

