import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateTaskboardStore, useTaskboardStore_noTaskboards, useTaskboardStore_selectedTaskboard, useTaskboardStore_taskboards, useTaskboardStore_taskboardsIsLoading } from "@/stores/taskboard";
import { useProjectStore_projectRole, useProjectStore_projectsIsLoading, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";

import { EProjectRole, TTaskboard } from "@repo/taskprio-types/src";
import { EllipsisVertical, Pencil, Plus, StopCircle, Trash2 } from "lucide-react";
import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router";
import TaskboardListSkeleton from "./TaskboardListSkeleton";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WebSocketContext } from "../websocket/WebsocketProvider";

const TaskboardList = () => {

    const taskboards = useTaskboardStore_taskboards()
    const taskboardsIsLoading = useTaskboardStore_taskboardsIsLoading()
    const noTaskboards = useTaskboardStore_noTaskboards()
    const projectsIsLoading = useProjectStore_projectsIsLoading()

    const showSkeleton = useMemo(() => {
        return (taskboardsIsLoading || projectsIsLoading)
    }, [taskboardsIsLoading, projectsIsLoading])

    const handleOpenCreateTaskboardDialog = () => {
        updateDialogsStore({
            createTaskboardDialog: {
                open: true
            }
        })
    }

    return (
        <div
            className="grow grid w-full h-full min-h-[2.55rem] ml-1 items-center mt-auto z-10 "
            style={{
                gridTemplateColumns: "min-content 1fr"
            }}
        >
            {
                !noTaskboards &&
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                className={"my-auto"}
                                onClick={handleOpenCreateTaskboardDialog}
                            >
                                <Plus />
                            </Button>
                        }
                    />
                    <TooltipContent>Create Taskboard</TooltipContent>
                </Tooltip>
            }
            <ScrollArea className="min-w-0 h-fit translate-y-[3px]" >
                <div
                    className="w-full max-w-full flex"
                >
                    {
                        (showSkeleton && !taskboards) &&
                        <TaskboardListSkeleton />
                    }
                    {
                        (!showSkeleton && taskboards) &&
                        taskboards?.map(taskboard => (
                            <TaskboardTabsTrigger
                                key={taskboard.task_board_id}
                                taskboard={taskboard}
                            />
                        ))
                    }
                    <div className="electron-custom-titlebar-drag-area flex w-full h-[2.7rem] grow" ></div>
                </div>
                <ScrollBar className="z-10" orientation="horizontal" />
            </ScrollArea>

        </div>
    )

}

export default TaskboardList;

type TTaskboardTabsTrigger = {
    taskboard: TTaskboard
}

const TaskboardTabsTrigger: React.FC<TTaskboardTabsTrigger> = ({
    taskboard
}) => {

    const navigate = useNavigate()
    const {
        channelActions
    } = useContext(WebSocketContext)

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
    const selectedProject = useProjectStore_selectedProject()
    const selectedTaskboard = useTaskboardStore_selectedTaskboard()
    const projectRole = useProjectStore_projectRole()

    const handleTaskboardTabOnClick = () => {
        if (selectedTaskboard?.task_board_id === taskboard.task_board_id) return
        updateTaskboardStore({
            selectedTaskboard: taskboard,
            noTaskboards: false
        })
        navigate(`/p/w/${selectedWorkspace?.workspace_id}/d/${selectedProject?.project_id}/t/${taskboard.task_board_id}`)
        channelActions.joinTaskboardChannel(taskboard.task_board_id)
    }

    const handleOpenRenameTaskboardDialog = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            renameTaskboardDialog: {
                open: true,
                taskboard
            }
        })
    }

    const handleOpenTrashTaskboardDialog = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            taskboardTaskTrashSheet: {
                open: true
            }
        })
    }

    const handleOpenDropTaskboardDialog = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            dropTaskboardDialog: {
                open: true,
                taskboard
            }
        })
    }

    const handleOpenDeactivateTaskboardDialog = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            deactivateTaskboardDialog: {
                open: true,
                taskboard
            }
        })
    }

    const selected = useMemo(() => {
        return selectedTaskboard?.task_board_id === taskboard.task_board_id
    }, [
        selectedTaskboard?.task_board_id,
        taskboard.task_board_id,
    ])

    const taskboardMenuVisible = useMemo(() => {
        return selectedTaskboard?.task_board_id === taskboard.task_board_id && [EProjectRole.ADMIN, EProjectRole.OWNER].includes(projectRole || EProjectRole.GUEST)
    }, [
        selectedTaskboard?.task_board_id,
        taskboard.task_board_id,
        projectRole
    ])

    return (
        <div
            className={cn(
                `relative flex items-center gap-2`,
                "h-fit min-h-[2.55rem] mt-auto p-1 pl-5 rounded-t-md cursor-pointer",
                `border border-b-0 border-transparent`,
                `first:ml-2`,
                !taskboardMenuVisible && `pr-5`,
                !selected && `pr-5 transition-colors hover:bg-foreground/5 hover:z-5`,
                selected && `bg-background border-foreground/15 z-10`,
            )}
            onClick={handleTaskboardTabOnClick}
        >
            <p className="text-sm text-nowrap" >{taskboard.task_board_name}</p>
            {
                taskboardMenuVisible &&
                <DropdownMenu modal={false} >
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                className="mr-[0.1rem]"
                            >
                                <EllipsisVertical />
                            </Button>
                        }
                    />
                    <DropdownMenuContent className="w-[14rem]" >
                        <DropdownMenuItem
                            onClick={handleOpenRenameTaskboardDialog}
                        >
                            Rename
                            <DropdownMenuShortcut><Pencil /></DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleOpenTrashTaskboardDialog}
                        >
                            Task Trash
                            <DropdownMenuShortcut><Trash2 /></DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-destructive" >Danger Zone</DropdownMenuLabel>
                            <DropdownMenuItem variant="destructive" onClick={handleOpenDeactivateTaskboardDialog} >
                                Deactivate
                                <DropdownMenuShortcut><StopCircle className="text-destructive" /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={handleOpenDropTaskboardDialog} >
                                Drop
                                <DropdownMenuShortcut><Trash2 className="text-destructive" /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        </div>
    )

}