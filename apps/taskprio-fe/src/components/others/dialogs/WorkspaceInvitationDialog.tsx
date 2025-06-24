import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetProjects } from "@/services/private/project/query";
import { updateDialogsStore, useDialogsStore } from "@/stores/dialogs";
import { useGlobalsStore } from "@/stores/globals";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../Spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useInviteToWorkspace } from "@/services/private/workspace/mutation";

const EmailInputSchema = z.object({
    email : z.string().email()
})

const WorkspaceInvitationDialog = () => {

    const { selectedWorkspace } = useGlobalsStore();
    const { workspaceInvitationDialog } = useDialogsStore();

    const [ emailInputValue, setEmailInputValue ] = useState<string>( "" );
    const [ emails, setEmails ] = useState<string[]>( [] );

    const emailInputForm = useForm<z.infer<typeof EmailInputSchema>>({
        resolver : zodResolver( EmailInputSchema ),
        defaultValues : {
            email : ""
        }
    })

    const {
        data : projects,
        isLoading : isProjectsLoading,
    } = useGetProjects( selectedWorkspace?.workspace_id )

    const {
        mutateAsync : inviteToWorkspace,
        isPending : isInvitingToWorkspace
    } = useInviteToWorkspace( () => {
        updateDialogsStore({
            workspaceInvitationDialog : {
                open : false
            }
        })
        setEmails( [] )
        emailInputForm.reset()
    } )

    const projectOptions = projects?.map( ( project ) => ({
        label : project.project_name,
        value : project.project_id
    }))

    const handleSubmit = ( data : z.infer<typeof EmailInputSchema> ) => {
        if ( !emails.includes( data.email ) ) {
            setEmails( [ ...emails, data.email ] );
        }
        emailInputForm.reset();
    }

    const handleSendInvitation = () => {
        if ( selectedWorkspace ) {
            inviteToWorkspace({
                workspace_id : selectedWorkspace.workspace_id,
                body : {
                    projects : [],
                    emails : emails
                }
            })
        }
    }

    return (
        <Dialog
            open={ workspaceInvitationDialog.open }
            onOpenChange={ ( open ) => {
                updateDialogsStore({
                    workspaceInvitationDialog : {
                        open : open
                    }
                })
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite to Workspace</DialogTitle>
                </DialogHeader>
                <div className=" flex flex-col gap-4 " >
                    <Form {...emailInputForm} >
                        <form onSubmit={ emailInputForm.handleSubmit( handleSubmit ) }>
                            <FormField
                                control={ emailInputForm.control }
                                name="email"
                                render={({ field }) => (
                                    <FormItem
                                        className=" flex flex-col gap-2 "
                                    >
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={ isInvitingToWorkspace }
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <div
                        className=" flex flex-wrap gap-2 "
                    >
                        {
                            emails.map( ( email ) => (
                                <Badge
                                    key={ email }
                                >
                                    { email }
                                </Badge>
                            ))
                        }
                    </div>
                    {
                        projects && projects.length > 0 &&
                        <div className=" flex flex-col gap-2 " >
                            {
                                projects.map( ( project ) => (
                                    <div
                                        key={ project.project_id }
                                        className=" flex gap-4 "
                                    >
                                        <Checkbox
                                            id={project.project_id}
                                        />
                                        <Label htmlFor={project.project_id} >{ project.project_name }</Label>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div>
                <DialogFooter>
                    <Button
                        disabled={ isInvitingToWorkspace }
                        onClick={ handleSendInvitation }
                    >Invite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
    
}

export default WorkspaceInvitationDialog;