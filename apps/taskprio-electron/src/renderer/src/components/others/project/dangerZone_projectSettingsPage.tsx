import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDialogsStore } from "@/stores/dialogs";
import { useProjectStore_selectedProject } from "@/stores/project";
import React from "react";

const DangerZone_ProjectSettingsPage = () => {

  const project = useProjectStore_selectedProject()
  const setDeactivateProjectDialog = useDialogsStore(state => state.setDeactivateProjectDialog)
  const setDropProjectDialog = useDialogsStore(state => state.setDropProjectDialog)

  return (
    <React.Fragment>
      <div className="SettingsSectionHeader" >
        <h3 className={`SettingsSectionHeaderTitle`} >Danger Zone</h3>
        <p className="SettingsSectionHeaderDescription" >
          Deactivate or delete the project.
        </p>
      </div>
      <div
        className={cn(
          `SettingsSectionContent`
        )}
      >
        <div className=" flex flex-col space-y-4 " >
          <div className=" flex flex-col space-y-2 " >
            <Button
              variant={"outline"}
              className="w-fit"
              onClick={() => {
                setDeactivateProjectDialog(project,true)
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
                setDropProjectDialog(true, project, "PROJECT")
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