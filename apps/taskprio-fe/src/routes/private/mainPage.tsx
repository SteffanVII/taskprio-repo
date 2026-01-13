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
import { cn } from "@/lib/utils";
import { useGlobalsStore_authenticated, useGlobalsStore_authenticateIsPending, useGlobalsStore_logoutIsPending } from "@/stores/globals";
import { useProjectStore_noProjects, useProjectStore_projectsIsLoading } from "@/stores/project";
import { useWorkspaceStore_noWorkspaces, useWorkspaceStore_workspacesIsLoading } from "@/stores/workspace";
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
import { LockKeyhole, Rocket } from "lucide-react";
import TaskboardTrashSheet from "@/components/others/taskboard/TaskboardTrashSheet";
import AcceptInvitationDialog from "@/components/others/dialogs/AcceptInvitationDialog";
import ProfileDialog from "@/components/others/dialogs/profileDialog/profileDialog";

const MainPage = () => {

    const {
        connected: webSocketConnected,
        initialConnection: webSocketInitialConnection
    } = useContext(WebSocketContext)
    const authenticated = useGlobalsStore_authenticated()
    const authenticateIsPending = useGlobalsStore_authenticateIsPending()
    const noProjects = useProjectStore_noProjects()
    const projectsIsLoading = useProjectStore_projectsIsLoading()
    const noWorkspaces = useWorkspaceStore_noWorkspaces()
    const workspacesIsLoading = useWorkspaceStore_workspacesIsLoading()
    const logoutIsPending = useGlobalsStore_logoutIsPending()

    const showLoadingScreen = useMemo(() => {
        return ((!authenticated || (!webSocketConnected && webSocketInitialConnection) || authenticateIsPending) && !logoutIsPending);
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
                            `fixed top-0 left-0 w-screen h-screen`,
                            ` size-full max-w-screen max-h-screen `,
                            ` flex flex-col gap-[4rem] items-center justify-center `,
                            ` bg-secondary/80 z-[49] `
                        )}
                    >
                        <div className="flex gap-[4rem]" >
                            <div className="relative flex gap-4 items-center" >
                                {
                                    authenticateIsPending &&
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" >
                                        <Spinner size="7xl" />
                                    </div>
                                }
                                <LockKeyhole
                                    className={cn(
                                        `size-[2rem]`,
                                        authenticated && `text-green-400`
                                    )}
                                />
                            </div>
                            <div className="relative flex flex-col gap-4 items-center" >
                                {
                                    !webSocketConnected &&
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" >
                                        <Spinner size="7xl" />
                                    </div>
                                }
                                <Rocket
                                    className={cn(
                                        `size-[2rem]`,
                                        webSocketConnected && `text-green-400`
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    :
                    <>
                        <MainDashboardPane />
                        <main
                            className={cn(
                                `relative w-full min-w-0 min-h-0 max-h-screen pt-[3rem] overflow-hidden `,
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
            }
        </>
    )

}

export default MainPage;