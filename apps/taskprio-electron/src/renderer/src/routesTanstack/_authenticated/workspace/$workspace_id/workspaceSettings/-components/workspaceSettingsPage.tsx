import DeactivatedProjects_WorkspaceSettingsPage from "@/routesTanstack/_authenticated/workspace/$workspace_id/workspaceSettings/-components/DeactivatedProjects_workspaceSettingsPage";
import Members_WorkspaceSettingsPage from "@/routesTanstack/_authenticated/workspace/$workspace_id/workspaceSettings/-components/members_workspaceSettingsPage";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export const WorkspaceSettingsPage = () => {

  const isWorkspaceAdminOrOwner = useIsUserWorkspaceOwnerOrAdmin()
  const sidebar = useSidebar()

  return (
    <div
      className={cn(
        `SettingsBodyContainer`
      )}
    >
      {
        sidebar.isMobile &&
        <Button
          variant={"ghost"}
          size={"icon"}
          className="absolute top-2 left-2"
          onClick={() => {
            sidebar.toggleSidebar()
          }}
        >
          <Menu />
        </Button>
      }
      <div
        className={cn(
          `SettingsBody`
        )}
      >
        <h2 className={` SettingsHeader `} >Workspace Settings</h2>
        <div
          className={cn(
            `SettingsSectionsContainer`
          )}
        >
          <Members_WorkspaceSettingsPage />
          {
            isWorkspaceAdminOrOwner &&
            <>
              <DeactivatedProjects_WorkspaceSettingsPage />
              {/* <DangerZone_WorkspaceSettingsPage/> */}
            </>
          }
        </div>
      </div>
    </div>
  )

}

export default WorkspaceSettingsPage;