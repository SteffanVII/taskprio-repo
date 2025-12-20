import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace, useGlobalsStore_user, useGlobalsStore_workspaces } from "@/stores/globals";
import { ETaskTodoPageUIMode, updateTaskTodoPageStore } from "@/stores/taskTodoPage";
import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types/src";
import { Home, Settings2 } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { WebSocketContext } from "../../websocket/WebsocketProvider";

const Header_TaskTodoPageOverlay = () => {

    const navigate = useNavigate()

    const workspaces = useGlobalsStore_workspaces()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const user = useGlobalsStore_user()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

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
        updateTaskTodoPageStore({
            uIMode : ETaskTodoPageUIMode.FULL
        })
        window.electronAPI.makeWindowToFullMode()
        setTimeout(() => {
            navigate(-1)
        }, 100)
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
                <Select
                    value={selectedWorkspace?.workspace_id}
                    onValueChange={ value => {
                        const foundValue = workspaces?.find( workspace => workspace.workspace_id === value )
                        if ( foundValue ) {
                            handleWorkspaceChange(foundValue)
                        }
                    } }
                >
                    <SelectTrigger className="!font-bold rounded-full shadow-lg shadow-primary" >
                        <SelectValue placeholder="Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            workspaces?.map( workspace => (
                                <SelectItem
                                    key={workspace.workspace_id}
                                    value={workspace.workspace_id}
                                >{workspace.workspace_name}</SelectItem>
                            ) )
                        }
                    </SelectContent>
                </Select>
            </div>
            <div
                className={cn(
                    `flex gap-2`
                )}
            >
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                        >
                            <Settings2/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preferences</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                            onClick={handleBackHome}
                        >
                            <Home/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Home</TooltipContent>
                </Tooltip>
                {/* <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                        >
                            <Eye/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Focus Mode</TooltipContent>
                </Tooltip> */}
            </div>
        </div>   
    )

}

export default Header_TaskTodoPageOverlay;