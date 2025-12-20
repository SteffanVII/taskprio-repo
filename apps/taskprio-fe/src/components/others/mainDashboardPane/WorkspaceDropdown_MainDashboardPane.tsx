import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace, useGlobalsStore_user, useGlobalsStore_workspaces, useGlobalsStore_workspacesIsLoading } from "@/stores/globals";

import { CheckCircle2Icon, ChevronDown, MessageCircleWarningIcon, Plus } from "lucide-react";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types/src";
import { useTaskTodoPageStore_sessionActive } from "@/stores/taskTodoPage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { WebSocketContext } from "../websocket/WebsocketProvider";

const ignoreTodoSessionIsActiveLocalStorageName = import.meta.env.VITE_IGNORE_TODO_SESSION_IS_ACTIVE_WARNING_LOCAL_STORAGE_NAME;

type TTodoSessionActiveWarning = {
    state : boolean,
    workspace : TWorkspace | null
}

const WorkspaceDropdown_MainDashboardPane = () => {

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        handlePauseSession,
        invalidateUseGetUserTaskTodoState
    } = useContext(StateManager_TaskTodoPageContext)

    const sessionActive = useTaskTodoPageStore_sessionActive()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const workspaces = useGlobalsStore_workspaces()
    const workspacesIsLoading = useGlobalsStore_workspacesIsLoading()
    const user = useGlobalsStore_user()

    const [ showTodoSessionIsActiveWarning, setTodoSessionIsActiveWarning ] = useState<TTodoSessionActiveWarning>({
        state : false,
        workspace : null
    })
    const [ ignoreTodoSessionActiveWarning, setIgnoreTodoSessionActiveWarning ] = useState<boolean>(Boolean(localStorage.getItem(ignoreTodoSessionIsActiveLocalStorageName + "_" + user?.user_id)) || false)

    const handleWorkspaceOnClick = ( workspace : TWorkspace ) => {
        if ( selectedWorkspace?.workspace_id === workspace.workspace_id ) return
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
        if ( sessionActive ) {
            handlePauseSession()
            invalidateUseGetUserTaskTodoState()
        }
        const workspaceRole : EWorkspaceRole | null = workspace.workspace_members.find( member => member.user_id === user?.user_id )?.workspace_role ?? null
        updateGlobalsStore({
            selectedWorkspace : workspace,
            workspaceRole,
            selectedProject : null,
            selectedTaskboard : null
        })
        if ( pathname.includes("/tt") ) {
            navigate(`/p/w/${workspace.workspace_id}/tt`)
        }
        else if ( pathname.includes("/workspace_settings") ) {
            navigate(`/p/w/${workspace.workspace_id}/workspace_settings`)
        } else {
            navigate(`/p/w/${workspace.workspace_id}`)
        }
        pathChangeMethods.updateWorkspacePath(workspace.workspace_id)
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
                            `border bg-background text-foreground rounded-md px-3 py-2`,
                            ` cursor-pointer flex items-center justify-between `
                        )}
                    >
                        {
                            (workspacesIsLoading) ?
                            <Skeleton className="bg-primary/20 w-[16rem] h-[1.8rem]" />
                            :
                            <>
                                {
                                    (workspaces && workspaces?.length === 0) &&
                                    <p className="text-center font-bold" >No Workspaces Found</p>
                                }
                                <p
                                    className={cn(
                                        " max-w-[16rem] truncate ",
                                        " text-xl font-bold "
                                    )}
                                    title={selectedWorkspace?.workspace_name}
                                >{selectedWorkspace?.workspace_name}</p>
                            </>
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
                                (workspaces && workspaces?.length === 0) &&
                                <p className="text-center font-bold" >No Workspaces Found</p>
                            }
                            {
                                workspaces?.map( workspace => (
                                    <Button
                                        key={workspace.workspace_id}
                                        variant={ selectedWorkspace?.workspace_id === workspace.workspace_id ? "default" : "ghost"}
                                        className=" justify-between gap-2 "
                                        onClick={() => handleWorkspaceOnClick(workspace)}
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