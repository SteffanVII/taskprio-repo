import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace } from "@/services/private/workspace/mutation";
import { updateDialogsStore, useDialogsStore } from "@/stores/dialogs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";

const createWorkspaceFormSchema = z.object({
    workspace_name : z.string()
})

const CreateWorkspaceDialog = () => {

    const {
        createWorkspaceDialog : {
            open
        }
    } = useDialogsStore()

    const createWorkspaceForm = useForm<z.infer<typeof createWorkspaceFormSchema>>({
        resolver : zodResolver(createWorkspaceFormSchema),
        defaultValues : {
            workspace_name : ""
        }
    })

    const {
        mutateAsync : createWorkspace,
        isPending : isCreatingWorkspace,
    } = useCreateWorkspace( () => {
        updateDialogsStore({
            createWorkspaceDialog : {
                open : false
            }
        })
    } )

    const onSubmit = async ( data : z.infer<typeof createWorkspaceFormSchema> ) => {
        await createWorkspace({
            body : {
                workspace_name : data.workspace_name
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                updateDialogsStore({
                    createWorkspaceDialog : {
                        open
                    }
                })
                if ( !open ) {
                    createWorkspaceForm.reset()
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>Please provide workspace details</DialogDescription>
                </DialogHeader>
                <Form
                    {...createWorkspaceForm}
                >
                    <form>
                        <FormField
                            control={createWorkspaceForm.control}
                            name="workspace_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Workspace Name"
                                            disabled={isCreatingWorkspace}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter
                    className=" justify-end "
                >
                    <Button
                        disabled={isCreatingWorkspace}
                        onClick={() => {
                            createWorkspaceForm.handleSubmit(onSubmit)()
                        }}
                    >
                        {
                            isCreatingWorkspace ?
                            <Spinner size="sm" />
                            :
                            "Create"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default CreateWorkspaceDialog;