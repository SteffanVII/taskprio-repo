import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace, useGlobalsStore_workspaceIsLoading, useGlobalsStore_workspaces } from "@/stores/globals";
import { ETaskTodoPageUIMode, updateTaskTodoPageStore } from "@/stores/taskTodoPage";
import { TWorkspace } from "@repo/taskprio-types/src";
import { FlipVerticalIcon, Home, Settings2 } from "lucide-react";
import { useNavigate } from "react-router";

const Header_TaskTodoPageOverlay = () => {

    const navigate = useNavigate()

    const workspaces = useGlobalsStore_workspaces()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const handleWorkspaceChange = ( workspace : TWorkspace ) => {
        if ( selectedWorkspace?.workspace_id === workspace.workspace_id ) return
        updateGlobalsStore({
            selectedWorkspace : workspace
        })
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
                ` p-4 `
            )}
        >
            <div
                className={cn(
                    `flex gap-4`
                )}
            >
                <Select
                    value={selectedWorkspace?.workspace_id}
                >
                    <SelectTrigger className="!font-bold shadow-lg shadow-primary" >
                        <SelectValue placeholder="Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            workspaces?.map( workspace => (
                                <SelectItem
                                    key={workspace.workspace_id}
                                    value={workspace.workspace_id}
                                    onClick={() => handleWorkspaceChange(workspace)}
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
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                        >
                            <FlipVerticalIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Focus Mode</TooltipContent>
                </Tooltip>
            </div>
        </div>   
    )

}

export default Header_TaskTodoPageOverlay;