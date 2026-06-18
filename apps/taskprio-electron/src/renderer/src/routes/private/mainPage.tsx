import CreateProjectDialog from "@/components/others/dialogs/CreateProjectDialog";
import CreateTaskboardDialog from "@/components/others/dialogs/CreateTaskboardDialog";
import CreateWorkspaceDialog from "@/components/others/dialogs/CreateWorkspaceDialog";
import RenameTaskboardDialog from "@/components/others/dialogs/RenameTaskboardDialog";
import TagDialog from "@/components/others/dialogs/TagDialog";
import DropTaskboardDialog from "@/components/others/dialogs/DropTaskboardDialog";
import WorkspaceInvitationDialog from "@/components/others/dialogs/WorkspaceInvitationDialog";
import MainDashboardPane from "@/components/others/mainDashboardPane/MainDashboardPane";
import NoProjectStage from "@/components/others/mainPageComponents/NoProjectStage";
import { cn } from "@/lib/utils";
import { useProjectStore_noProjects, useProjectStore_projectsIsLoading } from "@/stores/project";
import { useWorkspaceStore_noWorkspaces, useWorkspaceStore_workspacesIsLoading } from "@/stores/workspace";
import { Outlet } from "@tanstack/react-router";
import DeactivateTaskboardDialog from "@/components/others/dialogs/DeactivateTaskboardDialog";
import ReactivateTaskboardDialog from "@/components/others/dialogs/ReactivateTaskboardDialog";
import DeactivateProjectDialog from "@/components/others/dialogs/DeactivateProjectDialog";
import DropProjectDialog from "@/components/others/dialogs/DropProjectDialog";
import ReactivateProjectDialog from "@/components/others/dialogs/ReactivateProjectDialog";
import NoWorkspaceStage from "@/components/others/mainPageComponents/NoWorkspaceStage";
import TaskboardTaskAssignerDialog from "@/components/others/dialogs/TaskboardTaskAssignerDialog";
import TaskboardTrashSheet from "@/components/others/taskboard/TaskboardTrashSheet";
import AcceptInvitationDialog from "@/components/others/dialogs/AcceptInvitationDialog";
import ProfileDialog from "@/components/others/dialogs/profileDialog/profileDialog";

const MainPage = () => {

  const noProjects = useProjectStore_noProjects()
  const projectsIsLoading = useProjectStore_projectsIsLoading()
  const noWorkspaces = useWorkspaceStore_noWorkspaces()
  const workspacesIsLoading = useWorkspaceStore_workspacesIsLoading()

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

export default MainPage;