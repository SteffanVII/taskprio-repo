import CreateProjectDialog from "@/components/others/dialogs/CreateProjectDialog";
import CreateTaskboardDialog from "@/components/others/dialogs/CreateTaskboardDialog";
import CreateWorkspaceDialog from "@/components/others/dialogs/CreateWorkspaceDialog";
import WorkspaceInvitationDialog from "@/components/others/dialogs/WorkspaceInvitationDialog";
import MainDashboardPane from "@/components/others/mainDashboardPane/MainDashboardPane";
import Spinner from "@/components/others/Spinner";
import { WebSocketContext } from "@/components/others/websocket/WebsocketHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateProject } from "@/services/private/project/mutation";
import { useCreateWorkspace } from "@/services/private/workspace/mutation";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router";


const MainPage = () => {

    const navigate = useNavigate()

    const {
        connected
    } = useContext(WebSocketContext)

    const {
        authenticated,
        selectedWorkspace,
        noProjects,
        projectsIsLoading
    } = useGlobalsStore()

    const [ workspaceName, setWorkspaceName ] = useState<string>("")
    const [ projectName, setProjectName ] = useState<string>("")

    const {
        data : workspaces,
        isLoading : isLoadingWorkspaces
    } = useGetUserWorkspaces()

    const {
        mutateAsync : createWorkspace,
        isPending : isCreatingWorkspace,
    } = useCreateWorkspace()

    const {
        mutateAsync : createProject,
        isPending : isCreatingProject,
    } = useCreateProject( ( response ) => {
        if ( !selectedWorkspace ) return
        setProjectName("")
        updateGlobalsStore({
            noProjects : false
        })
        navigate(`/p/w/${selectedWorkspace.workspace_slug}/d/${response.project_slug}`)
    } )

    const onSubmitCreateWorkspace = async ( workspaceName : string ) => {
        const response = await createWorkspace({
            body : {
                workspace_name : workspaceName
            }
        })
        setWorkspaceName("")
        navigate(`/p/w/${response.workspace_slug}`)
    }

    const onSubmitCreateProject = async ( projectName : string ) => {
        if ( !selectedWorkspace ) return
        await createProject({
            body : {
                project_name : projectName,
                workspace_id : selectedWorkspace.workspace_id
            }
        })
    }

    return (
        <>
            {
                ( !authenticated || isLoadingWorkspaces || !connected ) ?
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
                <div
                    className={cn(
                        ` size-full max-w-screen max-h-screen `,
                        ` flex items-center justify-center `,
                        ` bg-background z-50 `
                    )}
                >
                    <Card
                        className={cn(
                            ` w-[30rem] `
                        )}
                    >
                        <CardHeader>
                            <CardTitle>No Workspace</CardTitle>
                            <CardDescription>You're currently not a member of any workspace. Please create one or join a workspace.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="Workspace name"
                                value={workspaceName}
                                onChange={ ( e ) => setWorkspaceName( e.target.value ) }
                                disabled={isCreatingWorkspace}
                            />
                        </CardContent>
                        <CardFooter
                            className=" justify-end "
                        >
                            <Button
                                variant="outline"
                                disabled={isCreatingWorkspace}
                                onClick={ () => onSubmitCreateWorkspace( workspaceName ) }
                            >
                                {
                                    isCreatingWorkspace ?
                                    <Spinner size="sm" />
                                    :
                                    "Create workspace"
                                }
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
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
                            <div
                                className={` size-full flex items-center justify-center `}
                            >
                                <Card
                                    className={cn(
                                        ` w-[30rem] border-none shadow-none `
                                    )}
                                >
                                    <CardHeader>
                                        <CardTitle>No Projects</CardTitle>
                                        <CardDescription>This workspace doesn't have any projects. Please create one.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            placeholder="Project name"
                                            value={projectName}
                                            onChange={ ( e ) => setProjectName( e.target.value ) }
                                            disabled={isCreatingProject}
                                        />
                                    </CardContent>
                                    <CardFooter
                                        className=" justify-end "
                                    >
                                        <Button
                                            variant="outline"
                                            disabled={isCreatingProject}
                                            onClick={ () => onSubmitCreateProject( projectName ) }
                                        >
                                            {
                                                isCreatingProject ?
                                                <Spinner size="sm" />
                                                :
                                                "Create project"
                                            }
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
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
                </div>
            }
        </>
    )

}

export default MainPage;