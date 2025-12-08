import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateGlobalsStore, useGlobalsStore_noTaskboards, useGlobalsStore_projectsIsLoading, useGlobalsStore_selectedProject, useGlobalsStore_selectedTaskboard, useGlobalsStore_selectedWorkspace, useGlobalsStore_taskboards, useGlobalsStore_taskboardsIsLoading } from "@/stores/globals";

import { TTaskboard } from "@repo/taskprio-types/src";
import { Pencil, Plus, StopCircle, Trash2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import TaskboardListSkeleton from "./TaskboardListSkeleton";

const TaskboardList = () => {

    const taskboards = useGlobalsStore_taskboards()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()
    const taskboardsIsLoading = useGlobalsStore_taskboardsIsLoading()
    const noTaskboards = useGlobalsStore_noTaskboards()
    const projectsIsLoading = useGlobalsStore_projectsIsLoading()

    const showSkeleton = useMemo(() => {
        return (taskboardsIsLoading || projectsIsLoading)
    }, [ taskboardsIsLoading, projectsIsLoading ])

    const handleOpenCreateTaskboardDialog = () => {
        updateDialogsStore({
            createTaskboardDialog : {
                open : true
            }
        })
    }

    return (
        <div
            className="pl-1 grid w-full max-w-full min-w-0 gap-1 bg-accent/50"
            style={{
                gridTemplateColumns : "min-content 1fr"
            }}
        >
            {
                !noTaskboards &&
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            variant={"ghost"}
                            size={"icon-sm"}
                            onClick={handleOpenCreateTaskboardDialog}
                        >
                            <Plus/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Taskboard</TooltipContent>
                </Tooltip>
            }
            <ScrollArea className="min-w-0" >
                <Tabs
                    value={selectedTaskboard?.task_board_id}
                >
                    <TabsList
                        variant={"taskboardSelect"}
                        className="bg-transparent pl-1"
                    >
                        {
                            (showSkeleton && !taskboards) &&
                            <TaskboardListSkeleton/>
                        }
                        {
                            (!showSkeleton && taskboards) &&
                            taskboards?.map( taskboard => (
                                <TaskboardTabsTrigger
                                    key={taskboard.task_board_id}
                                    taskboard={taskboard}
                                />
                            ) )
                        }
                    </TabsList>
                </Tabs>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

        </div>
    )

}

export default TaskboardList;

type TTaskboardTabsTrigger = {
    taskboard : TTaskboard
}

const TaskboardTabsTrigger : React.FC<TTaskboardTabsTrigger> = ({
    taskboard
}) => {

    const navigate = useNavigate()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()

    const handleTaskboardTabOnClick = () => {
        updateGlobalsStore({
            selectedTaskboard : taskboard,
            noTaskboards : false
        })
        navigate( `/p/w/${selectedWorkspace?.workspace_id}/d/${selectedProject?.project_id}/t/${taskboard.task_board_id}` )
    }

    const handleOpenRenameTaskboardDialog = ( e : React.MouseEvent ) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            renameTaskboardDialog : {
                open : true,
                taskboard
            }
        })
    }

    const handleOpenTrashTaskboardDialog = ( e : React.MouseEvent ) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            renameTaskboardDialog : {
                open : true,
                taskboard
            }
        })
    }

    const handleOpenDropTaskboardDialog = ( e : React.MouseEvent ) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            dropTaskboardDialog : {
                open : true,
                taskboard
            }
        })
    }

    const handleOpenDeactivateTaskboardDialog = ( e : React.MouseEvent ) => {
        e.stopPropagation()
        e.preventDefault()
        updateDialogsStore({
            deactivateTaskboardDialog : {
                open : true,
                taskboard
            }
        })
    }

    return (
        <TabsTrigger
            variant={"taskboardSelect"}
            className="relative rounded-t-md"
            value={taskboard.task_board_id}
            onClick={handleTaskboardTabOnClick}
        >
            {taskboard.task_board_name}
            <ContextMenu
                modal={false}
            >
                <ContextMenuTrigger asChild >
                    <div
                        className="absolute top-0 left-0 size-full"
                    ></div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-[14rem]" >
                    <ContextMenuItem
                        onClick={handleOpenRenameTaskboardDialog}
                    >Rename <Pencil className="ml-auto" /></ContextMenuItem>
                    <ContextMenuItem
                        onClick={handleOpenRenameTaskboardDialog}
                    >Trash <Trash2 className="ml-auto" /></ContextMenuItem>
                    <ContextMenuSeparator/>
                    <ContextMenuGroup>
                        <ContextMenuLabel className="text-destructive" >Danger Zone</ContextMenuLabel>
                        <ContextMenuItem
                            variant="destructive"
                            onClick={handleOpenDeactivateTaskboardDialog}
                        >Deactivate <StopCircle className="ml-auto text-destructive" /></ContextMenuItem>
                        <ContextMenuItem
                            variant="destructive"
                            onClick={handleOpenDropTaskboardDialog}
                            >Drop <Trash2 className="ml-auto text-destructive" /></ContextMenuItem>
                    </ContextMenuGroup>
                </ContextMenuContent>
            </ContextMenu>
        </TabsTrigger>
    )

}