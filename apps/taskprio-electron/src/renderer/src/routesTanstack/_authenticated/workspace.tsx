import AcceptInvitationDialog from "@/components/others/dialogs/AcceptInvitationDialog";
import CreateProjectDialog from "@/components/others/dialogs/CreateProjectDialog";
import CreateTaskboardDialog from "@/components/others/dialogs/CreateTaskboardDialog";
import CreateWorkspaceDialog from "@/components/others/dialogs/CreateWorkspaceDialog";
import DeactivateProjectDialog from "@/components/others/dialogs/DeactivateProjectDialog";
import DeactivateTaskboardDialog from "@/components/others/dialogs/DeactivateTaskboardDialog";
import DropProjectDialog from "@/components/others/dialogs/DropProjectDialog";
import DropTaskboardDialog from "@/components/others/dialogs/DropTaskboardDialog";
import ProfileDialog from "@/components/others/dialogs/profileDialog/profileDialog";
import ReactivateProjectDialog from "@/components/others/dialogs/ReactivateProjectDialog";
import ReactivateTaskboardDialog from "@/components/others/dialogs/ReactivateTaskboardDialog";
import RenameTaskboardDialog from "@/components/others/dialogs/RenameTaskboardDialog";
import TagDialog from "@/components/others/dialogs/TagDialog";
import TaskboardTaskAssignerDialog from "@/components/others/dialogs/TaskboardTaskAssignerDialog";
import WorkspaceInvitationDialog from "@/components/others/dialogs/WorkspaceInvitationDialog";
import MainDashboardPane from "@/components/others/mainDashboardPane/MainDashboardPane";
import NoProjectStage from "@/components/others/mainPageComponents/NoProjectStage";
import NoWorkspaceStage from "@/components/others/mainPageComponents/NoWorkspaceStage";
import TaskboardTrashSheet from "@/components/others/taskboard/TaskboardTrashSheet";
import { cn } from "@/lib/utils";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { useProjectStore_noProjects } from "@/stores/project";
import { useWorkspaceStore_noWorkspaces } from "@/stores/workspace";
import { createFileRoute, Outlet } from "@tanstack/react-router";


export const Route = createFileRoute("/_authenticated/workspace")({
  component: WorkspaceLayout
})

function WorkspaceLayout() {

  const noProjects = useProjectStore_noProjects()
  const noWorkspaces = useWorkspaceStore_noWorkspaces()

  const {
    isLoading: workspacesIsLoading
  } = useGetUserWorkspaces()

  const {
    isLoading: projectsIsLoading
  } = useGetUserProjectsByWorkspace()

  return (
    <>
      <MainDashboardPane />
      <main
        className={cn(
          `relative w-full min-w-0 min-h-0 max-h-screen overflow-hidden `,
          `flex flex-col grow`
        )}
      >
        {
          (noWorkspaces && !workspacesIsLoading) ?
            // Show no workspaces stage
            <NoWorkspaceStage />
            :
            // Show main page
            <>
              {
                (noProjects && !projectsIsLoading) ?
                  // Show no projects stage
                  <NoProjectStage />
                  :
                  <>
                    <Outlet />
                  </>
              }
            </>
        }
      </main>
      <CreateProjectDialog />
      <CreateWorkspaceDialog />
      <CreateTaskboardDialog />
      <RenameTaskboardDialog />
      <DropTaskboardDialog />
      <DeactivateTaskboardDialog />
      <ReactivateTaskboardDialog />
      <DropProjectDialog />
      <DeactivateProjectDialog />
      <ReactivateProjectDialog />
      <WorkspaceInvitationDialog />
      <ProfileDialog />
      <TagDialog />
      <TaskboardTaskAssignerDialog />
      <TaskboardTrashSheet />
      <AcceptInvitationDialog />
    </>
  )
}