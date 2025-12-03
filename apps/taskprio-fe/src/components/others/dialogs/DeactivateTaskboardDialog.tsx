import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDeactivateTaskboard } from "@/services/private/taskboard/mutation";
import { updateDialogsStore, useDialogsStore_deactivateTaskboardDialog } from "@/stores/dialogs";

import { useGlobalsStore_selectedProject } from "@/stores/globals";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const DeactivateTaskboardDialog = () => {

    const {
        open,
        taskboard
    } = useDialogsStore_deactivateTaskboardDialog()

    const selectedProject = useGlobalsStore_selectedProject()

    const {
        mutateAsync : deactivateTaskboardTrigger,
        isPending : deactiveTaskboardIsPending
    } = useDeactivateTaskboard({
        onSuccess : () => {
            updateDialogsStore({
                deactivateTaskboardDialog : {
                    open : false,
                    taskboard
                }
            })
        }
    })
    
    const deactivateTaskboardFormSchema = z.object({
        taskboard_name : z.string().min( 1, "Name of the taskboard is required" )
            .refine( value => {
                return value === taskboard?.task_board_name
            }, { message: `You must type "${taskboard?.task_board_name}" to confirm deletion.` } )
    })

    const form = useForm<z.infer<typeof deactivateTaskboardFormSchema>>({
        resolver : zodResolver( deactivateTaskboardFormSchema )
    })

    const onSubmit = async () => {
        deactivateTaskboardTrigger({
            taskboard_id : taskboard!.task_board_id,
            project_id : selectedProject!.project_id
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={ ( openValue ) => {
                if ( !openValue ) {
                    form.reset()
                }
                if ( !deactiveTaskboardIsPending ) {
                    updateDialogsStore({
                        deactivateTaskboardDialog : {
                            open : !open,
                            taskboard
                        }
                    })
                }
            } }
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
                            render={ ({ field }) => (
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
                        isLoading={deactiveTaskboardIsPending}
                    >Deactivate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default DeactivateTaskboardDialog;