import CreateProjectDialog from "@/components/others/dialogs/CreateProjectDialog";
import CreateTaskboardDialog from "@/components/others/dialogs/CreateTaskboardDialog";
import CreateWorkspaceDialog from "@/components/others/dialogs/CreateWorkspaceDialog";
import RenameTaskboardDialog from "@/components/others/dialogs/RenameTaskboardDialog";
import TagDialog from "@/components/others/dialogs/TagDialog";
import DropTaskboardDialog from "@/components/others/dialogs/DropTaskboardDialog";
import WorkspaceInvitationDialog from "@/components/others/dialogs/WorkspaceInvitationDialog";
import MainDashboardPane from "@/components/others/mainDashboardPane/MainDashboardPane";
import NoProjectStage from "@/components/others/mainPageComponents/NoProjectStage";
import Spinner from "@/components/others/Spinner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGlobalsStore_authenticated, useGlobalsStore_noProjects, useGlobalsStore_noWorkspaces, useGlobalsStore_projectsIsLoading, useGlobalsStore_workspacesIsLoading } from "@/stores/globals";
import { Outlet } from "react-router";
import DeactivateTaskboardDialog from "@/components/others/dialogs/DeactivateTaskboardDialog";
import ReactivateTaskboardDialog from "@/components/others/dialogs/ReactivateTaskboardDialog";
import DeactivateProjectDialog from "@/components/others/dialogs/DeactivateProjectDialog";
import DropProjectDialog from "@/components/others/dialogs/DropProjectDialog";
import ReactivateProjectDialog from "@/components/others/dialogs/ReactivateProjectDialog";
import NoWorkspaceStage from "@/components/others/mainPageComponents/NoWorkspaceStage";
import TaskboardTaskAssignerDialog from "@/components/others/dialogs/TaskboardTaskAssignerDialog";


const MainPage = () => {

    const authenticated = useGlobalsStore_authenticated()
    const noProjects = useGlobalsStore_noProjects()
    const projectsIsLoading = useGlobalsStore_projectsIsLoading()
    const noWorkspaces = useGlobalsStore_noWorkspaces()
    const workspacesIsLoading = useGlobalsStore_workspacesIsLoading()

    return (
        <>
            {
                ( !authenticated ) ?
                // Show loading screen when not authenticated
                <div
                    className={cn(
                        ` size-full max-w-screen max-h-screen `,
                        ` flex items-center justify-center `,
                        ` bg-background z-50 `
                    )}
                >
                    <Spinner size="xl" />
                </div>
                :
                <SidebarProvider>
                    <MainDashboardPane/>
                    <main
                        className={cn(
                            ` w-full min-w-0 min-h-0 grow max-h-screen overflow-hidden `,
                            ` flex flex-col `
                        )}
                    >
                        {
                            (noWorkspaces && !workspacesIsLoading) ?
                            // Show no workspaces stage
                            <NoWorkspaceStage/>
                            :
                            // Show main page
                            <>
                                {
                                    ( noProjects && !projectsIsLoading ) ?
                                    // Show no projects stage
                                    <NoProjectStage/>
                                    :
                                    <>                  
                                        <Outlet/>
                                    </>
                                }
                            </>
                        }
                    </main>
                    <CreateProjectDialog/>
                    <CreateWorkspaceDialog/>
                    <CreateTaskboardDialog/>
                    <RenameTaskboardDialog/>
                    <DropTaskboardDialog/>
                    <DeactivateTaskboardDialog/>
                    <ReactivateTaskboardDialog/>
                    <DropProjectDialog/>
                    <DeactivateProjectDialog/>
                    <ReactivateProjectDialog/>
                    <WorkspaceInvitationDialog/>
                    <TagDialog/>
                    <TaskboardTaskAssignerDialog/>
                </SidebarProvider>
            }
        </>
    )

}

export default MainPage;