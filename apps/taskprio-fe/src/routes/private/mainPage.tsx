import CreateProjectDialog from "@/components/others/dialogs/CreateProjectDialog";
import CreateTaskboardDialog from "@/components/others/dialogs/CreateTaskboardDialog";
import CreateWorkspaceDialog from "@/components/others/dialogs/CreateWorkspaceDialog";
import TagDialog from "@/components/others/dialogs/TagDialog";
import WorkspaceInvitationDialog from "@/components/others/dialogs/WorkspaceInvitationDialog";
import MainDashboardPane from "@/components/others/mainDashboardPane/MainDashboardPane";
import NoProjectStage from "@/components/others/mainPageComponents/NoProjectStage";
import NoWorkspaceStage from "@/components/others/mainPageComponents/NoWorkspaceStage";
import Spinner from "@/components/others/Spinner";
import { cn } from "@/lib/utils";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { useGlobalsStore } from "@/stores/globals";
import { Outlet } from "react-router";


const MainPage = () => {

    const {
        authenticated,
        noProjects,
        projectsIsLoading
    } = useGlobalsStore()

    const {
        data : workspaces,
        isLoading : isLoadingWorkspaces
    } = useGetUserWorkspaces()

    return (
        <>
            {
                ( !authenticated || isLoadingWorkspaces ) ?
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
                workspaces && workspaces?.length < 1 ?
                <NoWorkspaceStage/>
                :
                <div
                    className={cn(
                        ` size-full max-w-screen max-h-screen `,
                        ` flex overflow-hidden `
                    )}
                >
                    <MainDashboardPane/>
                    <div
                        className={cn(
                            ` w-full min-w-0 grow `,
                            ` flex flex-col `
                        )}
                    >
                        {
                            ( noProjects && !projectsIsLoading ) ?
                            <NoProjectStage/>
                            :
                            <>                  
                                <Outlet/>
                            </>
                        }
                    </div>
                    <CreateProjectDialog/>
                    <CreateWorkspaceDialog/>
                    <CreateTaskboardDialog/>
                    <WorkspaceInvitationDialog/>
                    <TagDialog/>
                </div>
            }
        </>
    )

}

export default MainPage;