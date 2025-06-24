import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/services/private/project/mutation";
import { updateDialogsStore, useDialogsStore } from "@/stores/dialogs";
import { useGlobalsStore } from "@/stores/globals";
import { useState } from "react";

const CreateProjectDialog = () => {

    const {
        createProjectDialog : {
            open
        }
    } = useDialogsStore()

    const {
        selectedWorkspace
    } = useGlobalsStore()

    const [ projectName, setProjectName ] = useState<string>("")

    const {
        mutateAsync : createProject,
        isPending : isCreatingProject
    } = useCreateProject()

    const onSubmit = async () => {
        if ( !selectedWorkspace ) return
        await createProject({
            body : {
                project_name : projectName,
                workspace_id : selectedWorkspace.workspace_id
            }
        })
        updateDialogsStore({
            createProjectDialog : {
                open : false
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={() => {
            updateDialogsStore({
                createProjectDialog : {
                    open : !open
                }
            })
        }}>
            <DialogContent>
                <DialogTitle>Create Project</DialogTitle>
                <div>
                    <Input
                        value={projectName}
                        onChange={(e) => {
                            setProjectName(e.target.value)
                        }}
                        placeholder="Project Name"
                        disabled={isCreatingProject}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant={"outline"}
                        onClick={onSubmit}
                        disabled={isCreatingProject}
                    >Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default CreateProjectDialog;