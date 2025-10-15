import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGetUserWorkspace, useGetUserWorkspaces } from "@/services/private/workspace/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { CheckCircle2Icon, ChevronDown, MessageCircleWarningIcon, Plus } from "lucide-react";
import { useContext, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { WebSocketContext } from "../websocket/WebsocketHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { TWorkspace } from "@repo/taskprio-types/src";
import { StateManager_TaskTodoPageContext } from "../taskTodo/StateManager_TaskTodoPage";
import useTaskTodoPageStore from "@/stores/taskTodoPage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ignoreTodoSessionIsActiveLocalStorageName = import.meta.env.VITE_IGNORE_TODO_SESSION_IS_ACTIVE_WARNING_LOCAL_STORAGE_NAME;

type TTodoSessionActiveWarning = {
    state : boolean,
    workspace : TWorkspace | null
}

const WorkspaceDropdown_MainDashboardPane = () => {

    const navigate = useNavigate()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        handlePauseSession,
    } = useContext(StateManager_TaskTodoPageContext)

    const {
        sessionActive
    } = useTaskTodoPageStore()

    const {
        workspace_id
    } = useParams()

    const {
        pathname
    } = useLocation()

    const {
        selectedWorkspace,
        user
    } = useGlobalsStore()

    const {
        data : workspaces,
        isLoading : isLoadingWorkspaces
    } = useGetUserWorkspaces()

    const {
        data : workspace,
    } = useGetUserWorkspace(
        workspace_id
    )

    const [ showTodoSessionIsActiveWarning, setTodoSessionIsActiveWarning ] = useState<TTodoSessionActiveWarning>({
        state : false,
        workspace : null
    })
    const [ ignoreTodoSessionActiveWarning, setIgnoreTodoSessionActiveWarning ] = useState<boolean>(Boolean(localStorage.getItem(ignoreTodoSessionIsActiveLocalStorageName + "_" + user?.user_id)) || false)

    // If no workspace_id is selected, navigate to the first workspace once the workspaces data are available
    useLayoutEffect(() => {
        // If the user is on the workspace settings page, don't navigate to the first workspace
        if (
            pathname.includes("/workspace_settings") ||
            pathname.includes("/tt")
        ) return

        if ( !workspace_id ) {
            if ( workspaces && workspaces.length > 0 ) {
                navigate(`/p/w/${workspaces[0].workspace_id}`)
            }
        }
    }, [ workspaces, workspace_id ])

    // Update the selectedWorkspace in the globals store if the workspace_id is the same as the workspace data from the query
    useLayoutEffect(() => {
        if ( workspace && workspace.workspace_id === workspace_id ) {
            pathChangeMethods.updateWorkspacePath(workspace.workspace_id)
            updateGlobalsStore({
                selectedWorkspace : workspace,
                workspaceRole : workspace.workspace_members.find( member => member.user_id === user?.user_id )?.workspace_role ?? null
            })
        }
    }, [ workspace, workspace_id ])

    const handleWorkspaceOnClick = ( workspace : TWorkspace ) => {
        if ( sessionActive && !ignoreTodoSessionActiveWarning ) {
            setTodoSessionIsActiveWarning({
                state : true,
                workspace
            })
            return
        }
        handleWorkspaceNavigate( workspace )
    }

    const handleNavigateAnywayOnClick = () => {
        if ( showTodoSessionIsActiveWarning.workspace && showTodoSessionIsActiveWarning.state === true ) {
            handleWorkspaceNavigate(showTodoSessionIsActiveWarning.workspace)
            setTodoSessionIsActiveWarning({
                state : false,
                workspace : null
            })
        }
    }

    const handleWorkspaceNavigate = ( workspace : TWorkspace ) => {
        updateGlobalsStore({
            selectedProject : null,
            selectedTaskboard : null
        })
        handlePauseSession()
        navigate(`/p/w/${workspace.workspace_id}`)
    }

    const handleIgnoreTodoSessionActiveWarningCheckbox = ( value : boolean ) => {
        setIgnoreTodoSessionActiveWarning(value)
        localStorage.setItem(ignoreTodoSessionIsActiveLocalStorageName + "_" + user?.user_id, value ? "true" : "false" )
    }

    return (
        <>
            <Popover>
                <PopoverTrigger asChild >
                    <div
                        className={cn(
                            ` cursor-pointer flex items-center justify-between `
                        )}
                    >
                        {
                            isLoadingWorkspaces ?
                            <Skeleton className=" w-[16rem] h-[2rem]" />
                            :
                            <p
                                className={cn(
                                    " max-w-[16rem] truncate ",
                                    " text-xl font-bold "
                                )}
                                title={selectedWorkspace?.workspace_name}
                            >{selectedWorkspace?.workspace_name}</p>
                        }
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
                                        key={workspace.workspace_id}
                                        variant={ selectedWorkspace?.workspace_id === workspace.workspace_id ? "default" : "ghost"}
                                        className=" justify-between gap-2 "
                                        onClick={() => handleWorkspaceOnClick(workspace)}
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
                                " flex justify-center items-center gap-2 rounded-b-md ",
                                " text-sm ",
                                " hover:bg-muted-foreground/10 active:bg-muted-foreground/20 "
                            )}
                        >Create New Workspace <Plus className="size-4" /></button>
                    </div>
                </PopoverContent>
            </Popover>
            <Dialog
                open={showTodoSessionIsActiveWarning.state}
                onOpenChange={ open => {
                    if (!open) {
                        setTodoSessionIsActiveWarning({
                            state : false,
                            workspace : null
                        })
                    }
                } }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex gap-2 items-center" ><MessageCircleWarningIcon/> Todo timer is currently running</DialogTitle>
                        <DialogDescription>Switching workspace would pause the active todo timer</DialogDescription>
                    </DialogHeader>
                    <div className=" flex gap-2 py-4 " >
                        <Checkbox
                            id="ignoreInFuture"
                            checked={ignoreTodoSessionActiveWarning}
                            onCheckedChange={handleIgnoreTodoSessionActiveWarningCheckbox}
                        /><Label htmlFor="ignoreInFuture" >Ignore this message in the future.</Label>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleNavigateAnywayOnClick}
                        >Navigate anyway</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )

}

export default WorkspaceDropdown_MainDashboardPane;