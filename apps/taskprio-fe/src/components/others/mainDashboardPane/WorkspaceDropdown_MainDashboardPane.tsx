import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { CheckCircle2Icon, ChevronDown, Plus } from "lucide-react";
import { useContext, useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { WebSocketContext } from "../websocket/WebsocketHandler";



const WorkspaceDropdown_MainDashboardPane = () => {

    const navigate = useNavigate()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        workspace_slug
    } = useParams()

    const {
        selectedWorkspace
    } = useGlobalsStore()

    const {
        data : workspaces,
        isLoading : isLoadingWorkspaces
    } = useGetUserWorkspaces()

    // const selectedWorkspace = useMemo(() => {
    //     const workspace = workspaces?.find((workspace) => workspace.workspace_slug === workspace_slug)
    //     if ( workspace ) {
    //         pathChangeMethods.updateWorkspacePath(workspace.workspace_id)
    //     }
    //     updateGlobalsStore({
    //         selectedWorkspace : workspace
    //     })
    //     return workspace
    // }, [ workspaces, workspace_slug ])

    useLayoutEffect(() => {
        const workspace = workspaces?.find((workspace) => workspace.workspace_slug === workspace_slug)
        if ( workspace && workspace.workspace_id !== selectedWorkspace?.workspace_id ) {
            pathChangeMethods.updateWorkspacePath(workspace.workspace_id)
        }
        updateGlobalsStore({
            selectedWorkspace : workspace
        })
    }, [ workspaces, workspace_slug ])

    // If no workspace_slug is selected, navigate to the first workspace once the workspaces data are available
    useLayoutEffect(() => {
        if ( !workspace_slug ) {
            if ( workspaces && workspaces.length > 0 ) {
                console.log("ss");
                navigate(`/p/w/${workspaces[0].workspace_slug}`)
            }
        }
    }, [ workspaces, workspace_slug ])

    // useLayoutEffect(() => {
    //     if ( selectedWorkspace && selectedWorkspaceFromStore?.workspace_id !== selectedWorkspace.workspace_id ) {
    //         pathChangeMethods.updateWorkspacePath(selectedWorkspace.workspace_id)
    //     }
    // }, [ selectedWorkspace ])

    return (
        <Popover>
            <PopoverTrigger asChild >
                <div
                    className={cn(
                        ` cursor-pointer flex items-center justify-between `
                    )}
                >
                    <p
                        className={cn(
                            " max-w-[16rem] truncate ",
                            " text-xl font-bold "
                        )}
                        title={selectedWorkspace?.workspace_name}
                    >{selectedWorkspace?.workspace_name}</p>
                    <ChevronDown className=" size-4 " />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
            >
                <div
                    className={cn(
                        ` flex flex-col `
                    )}
                >
                    <div
                        className={cn(
                            ` p-2 `,
                            ` flex flex-col gap-2 `
                        )}
                    >
                        {
                            workspaces?.map( workspace => (
                                <Button
                                    variant={ selectedWorkspace?.workspace_id === workspace.workspace_id ? "default" : "ghost"}
                                    className=" justify-between gap-2 "
                                    onClick={() => {
                                        navigate(`/p/w/${workspace.workspace_slug}`)
                                    }}
                                    disabled={selectedWorkspace?.workspace_id === workspace.workspace_id}
                                >
                                    { workspace.workspace_name }
                                    { selectedWorkspace?.workspace_id === workspace.workspace_id && <CheckCircle2Icon className="size-4" /> }
                                </Button>
                            ) )
                        }
                    </div>
                    <Separator/>
                    <button
                        onClick={() => {
                            updateDialogsStore({
                                createWorkspaceDialog : {
                                    open : true
                                }
                            })
                        }}
                        className={cn(
                            " p-2 ",
                            " flex justify-center items-center gap-2 ",
                            " text-sm "
                        )}
                    >Create New Workspace <Plus className="size-4" /></button>
                </div>
            </PopoverContent>
        </Popover>
    )

}

export default WorkspaceDropdown_MainDashboardPane;