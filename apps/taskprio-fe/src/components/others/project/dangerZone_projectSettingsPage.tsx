import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateDialogsStore } from "@/stores/dialogs";
import { useGlobalsStore_selectedProject } from "@/stores/globals";
import React from "react";

const DangerZone_ProjectSettingsPage = () => {

    const project = useGlobalsStore_selectedProject()

    return (
        <React.Fragment>
            <div className=" flex flex-col space-y-2 " >
                <h3 className={` text-lg text-destructive font-medium `} >Danger Zone</h3>
                <p className=" text-sm text-muted-foreground " >
                    Deactivate or delete the project.
                </p>
            </div>
            <div
                className={cn(
                    `p-4 border border-transparent rounded-md`,
                    `hover:bg-secondary/50 hover:border-foreground/10`
                )}
            >
                <div className=" flex flex-col space-y-4 " >
                    <div className=" flex flex-col space-y-2 " >
                        <Button
                            className="w-fit"
                            onClick={() => {
                                updateDialogsStore({
                                    deactivateProjectDialog : {
                                        open : true,
                                        project
                                    }
                                })
                            }}
                        >
                            Deactivate Project
                        </Button>
                        <p className=" text-sm text-muted-foreground " >
                            Deactivate the project. This will hide the project from the dashboard.
                        </p>
                    </div>
                    <div className=" flex flex-col space-y-2 " >
                        <Button
                            variant={"destructive"}
                            className="w-fit"
                            onClick={() => {
                                updateDialogsStore({
                                    dropProjectDialog : {
                                        open : true,
                                        project
                                    }
                                })
                            }}
                        >Drop Project</Button>
                        <p className=" text-sm text-muted-foreground " >
                            Delete the project. This will delete the project and all its data.
                        </p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )

}

export default DangerZone_ProjectSettingsPage;