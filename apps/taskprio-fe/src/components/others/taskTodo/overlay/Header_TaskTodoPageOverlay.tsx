import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace, useGlobalsStore_user, useGlobalsStore_workspaces } from "@/stores/globals";
import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types/src";
import { Home, Settings2 } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { WebSocketContext } from "../../websocket/WebsocketProvider";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import { updateDialogsStore } from "@/stores/dialogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Header_TaskTodoPageOverlay = () => {

    const navigate = useNavigate()

    const workspaces = useGlobalsStore_workspaces()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const user = useGlobalsStore_user()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        switchToFullModeFromOverlayOrFocusMode
    } = useContext(StateManager_ElectronContext)

    const handleWorkspaceChange = ( workspace : TWorkspace ) => {
        if ( selectedWorkspace?.workspace_id === workspace.workspace_id ) return
        const workspaceRole : EWorkspaceRole | null = workspace.workspace_members.find( member => member.user_id === user?.user_id )?.workspace_role ?? null
        updateGlobalsStore({
            selectedWorkspace : workspace,
            workspaceRole,
            selectedProject : null,
            selectedTaskboard : null
        })
        navigate(`/p/task_todo_overlay/${workspace.workspace_id}`)
        pathChangeMethods.updateWorkspacePath(workspace.workspace_id)
    }

    const handleBackHome = () => {
        switchToFullModeFromOverlayOrFocusMode()
    }

    const handleOpenPreferencesDialog = () => {
        updateDialogsStore({
            overlayModePreferencesDialog : {
                open : true
            }
        })
    }

    return (
        <div
            className={cn(
                `flex justify-between `,
                ` p-4 pb-0 `
            )}
        >
            <div
                className={cn(
                    `flex gap-4`
                )}
            >
                {/* <Select
                    items={workspaces?.map( workspace => ({
                        value : workspace.workspace_id,
                        label : workspace.workspace_name
                    }) )}
                    value={selectedWorkspace?.workspace_id}
                    onValueChange={ value => {
                        const foundValue = workspaces?.find( workspace => workspace.workspace_id === value )
                        if ( foundValue ) {
                            handleWorkspaceChange(foundValue)
                        }
                    } }
                >
                    <SelectTrigger className="!font-bold">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {
                            workspaces?.map( workspace => (
                                <SelectItem
                                    key={workspace.workspace_name}
                                    value={workspace.workspace_id}
                                >{workspace.workspace_name}</SelectItem>
                            ) )
                        }
                    </SelectContent>
                </Select> */}
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                onClick={handleOpenPreferencesDialog}
                            >
                                <Settings2/>
                            </Button>
                        }
                    />
                    <TooltipContent>Preferences</TooltipContent>
                </Tooltip>
            </div>
            <div
                className={cn(
                    `flex gap-2`
                )}
            >
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                onClick={handleBackHome}
                            >
                                <Home/>
                            </Button>
                        }
                    />
                    <TooltipContent>Home</TooltipContent>
                </Tooltip>
            </div>
        </div>   
    )

}

export default Header_TaskTodoPageOverlay;