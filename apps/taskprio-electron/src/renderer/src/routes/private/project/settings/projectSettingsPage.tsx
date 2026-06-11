import { cn } from "@/lib/utils";
import TagsSection_ProjectSettingsPage from "../../../../components/others/project/tagsSection_projectSetttingsPage";
import DangerZone_ProjectSettingsPage from "../../../../components/others/project/dangerZone_projectSettingsPage";
import Customization_ProjectSettingsPage from "@/components/others/project/customization_projectSettingsPage";
import Members_ProjectSettingsPage from "@/components/others/project/members_projectSettingsPage";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { useWorkspaceStore_workspaceRole } from "@/stores/workspace";

import { EWorkspaceRole } from "@repo/taskprio-types";
import DeactivatedTaskboards_ProjectSettingsPage from "@/components/others/project/DeactivatedTaskboards_ProjectSettingsPage";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import useGoToProjectPage from "@/lib/hooks/useGoToProjectPage";

const ProjectSettingsPage = () => {

  const workspaceRole = useWorkspaceStore_workspaceRole()

  const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()
  const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

  const goToProjectPage = useGoToProjectPage()

  return (
    <div
      className={cn(
        `SettingsBodyContainer`,
      )}
    >
      <div
        className={cn(
          `SettingsBody`
        )}
      >
        <div
          className={cn(
            `flex justify-between items-start`
          )}
        >
          <h2 className={` SettingsHeader `} >Project Settings</h2>
          <Button
            variant={"ghost"}
            size={"icon-lg"}
            onClick={goToProjectPage}
          ><X/></Button>
        </div>
        <div
          className={cn(
            `SettingsSectionsContainer`
          )}
        >
          <TagsSection_ProjectSettingsPage />
          {
            (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) &&
            <>
              <Customization_ProjectSettingsPage />
              <DeactivatedTaskboards_ProjectSettingsPage />
            </>
          }
          <Members_ProjectSettingsPage />
          {
            workspaceRole === EWorkspaceRole.OWNER &&
            <DangerZone_ProjectSettingsPage />
          }
        </div>
      </div>
    </div>
  )

}

export default ProjectSettingsPage;