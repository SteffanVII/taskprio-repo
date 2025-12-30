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
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGlobalsStore_authenticated, useGlobalsStore_authenticateIsPending, useGlobalsStore_logoutIsPending, useGlobalsStore_noProjects, useGlobalsStore_noWorkspaces, useGlobalsStore_projectsIsLoading, useGlobalsStore_workspacesIsLoading } from "@/stores/globals";
import { Outlet } from "react-router";
import DeactivateTaskboardDialog from "@/components/others/dialogs/DeactivateTaskboardDialog";
import ReactivateTaskboardDialog from "@/components/others/dialogs/ReactivateTaskboardDialog";
import DeactivateProjectDialog from "@/components/others/dialogs/DeactivateProjectDialog";
import DropProjectDialog from "@/components/others/dialogs/DropProjectDialog";
import ReactivateProjectDialog from "@/components/others/dialogs/ReactivateProjectDialog";
import NoWorkspaceStage from "@/components/others/mainPageComponents/NoWorkspaceStage";
import TaskboardTaskAssignerDialog from "@/components/others/dialogs/TaskboardTaskAssignerDialog";
import { useContext, useMemo } from "react";
import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import TaskboardTrashSheet from "@/components/others/taskboard/TaskboardTrashSheet";
import OverlaySettingsDialog from "@/components/others/dialogs/taskboardTaskDialog/overlaySettingsDialog/OverlaySettingsDialog";

const MainPage = () => {
    
    const {
        connected : webSocketConnected
    } = useContext(WebSocketContext)
    const authenticated = useGlobalsStore_authenticated()
    const authenticateIsPending = useGlobalsStore_authenticateIsPending()
    const noProjects = useGlobalsStore_noProjects()
    const projectsIsLoading = useGlobalsStore_projectsIsLoading()
    const noWorkspaces = useGlobalsStore_noWorkspaces()
    const workspacesIsLoading = useGlobalsStore_workspacesIsLoading()
    const logoutIsPending = useGlobalsStore_logoutIsPending()

    const showLoadingScreen = useMemo(() => {
        return (( !authenticated || !webSocketConnected || authenticateIsPending ) && !logoutIsPending);
    }, [
        authenticated,
        webSocketConnected,
        authenticateIsPending,
        logoutIsPending
    ])

    return (
        <>
            {
                showLoadingScreen ?
                // Show loading screen when not authenticated
                <div
                    className={cn(
                        ` size-full max-w-screen max-h-screen `,
                        ` flex flex-col gap-[4rem] items-center justify-center `,
                        ` bg-background z-50 `
                    )}
                >
                    <Spinner size="xl" />
                    <div className="flex flex-col gap-2" >
                        <div className="flex gap-4 items-center" >
                            <Label>Authenticated</Label>
                            {
                                authenticateIsPending ?
                                <Spinner/> : <Check className="text-green-400" />
                            }
                        </div>
                        <div className="flex gap-4 items-center" >
                            <Label>Websocket</Label>
                            {
                                !webSocketConnected ?
                                <Spinner/> : <Check className="text-green-400"/>
                            }
                        </div>
                    </div>
                </div>
                :
                <>
                    <SidebarProvider>
                        <MainDashboardPane/>
                        <SidebarInset
                            custom
                            className="z-10"
                        >
                            <div
                                className={cn(
                                    `relative w-full min-w-0 min-h-0 max-h-full overflow-hidden `,
                                    `flex flex-col grow`
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
                            </div>
                        </SidebarInset>
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
                        <TaskboardTrashSheet/>
                    </SidebarProvider>
                </>
            }
        </>
    )

}

export default MainPage;