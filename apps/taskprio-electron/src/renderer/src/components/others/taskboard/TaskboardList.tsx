import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTaskboardStore, useTaskboardStore_noTaskboards, useTaskboardStore_selectedTaskboard } from "@/stores/taskboard";
import { useProjectStore_projectRole, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";

import { EProjectRole, TTaskboard } from "@repo/taskprio-types";
import { EllipsisVertical, Pencil, Plus, StopCircle, Trash2 } from "lucide-react";
import React, { useContext, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import TaskboardListSkeleton from "./TaskboardListSkeleton";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WebSocketContext } from "../websocket/WebsocketProvider";
import { useGetProjectTaskboards } from "@/services/private/taskboard/query";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { useDialogsStore } from "@/stores/dialogs";

const TaskboardList = () => {

  const noTaskboards = useTaskboardStore_noTaskboards()
  const setCreateTaskboardDialog = useDialogsStore(state => state.setCreateTaskboardDialog)

  const {
    data : taskboards,
    isLoading : taskboardsIsLoading
  } = useGetProjectTaskboards()

  const {
    isLoading : projectsIsLoading
  } = useGetUserProjectsByWorkspace()

  const showSkeleton = useMemo(() => {
    return (taskboardsIsLoading || projectsIsLoading)
  }, [taskboardsIsLoading, projectsIsLoading])

  const handleOpenCreateTaskboardDialog = () => {
    setCreateTaskboardDialog(true)
  }

  return (
    <div
      className="grow grid w-full h-fit min-h-[2rem] mt-auto items-center z-10 bg-secondary"
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
                variant={"outline"}
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
      <ScrollArea className="min-w-0 h-fit" >
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
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)

  const handleTaskboardTabOnClick = () => {
    if (selectedTaskboard?.task_board_id === taskboard.task_board_id) return
    setSelectedTaskboard(taskboard)
    setNoTaskboards(false)
    navigate({
      to : "/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id",
      params : {
        taskboard_id : taskboard.task_board_id,
        project_id : selectedProject?.project_id!,
        workspace_id : selectedWorkspace?.workspace_id!
      }
    })
    channelActions.joinTaskboardChannel(taskboard.task_board_id)
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
        `first:ml-2`,
        !taskboardMenuVisible && `pr-5`,
        !selected && `pr-5 transition-colors hover:bg-foreground/5 hover:z-5`,
        selected && `bg-background z-10`,
      )}
      onClick={handleTaskboardTabOnClick}
    >
      <p className="text-sm text-nowrap" >{taskboard.task_board_name}</p>
      {
        taskboardMenuVisible &&
        <TaskboardTriggerDropdownMenu taskboard={taskboard} />
      }
    </div>
  )

}

type TTaskboardTriggerDropdownMenuProps = {
  taskboard: TTaskboard
}

const TaskboardTriggerDropdownMenu: React.FC<TTaskboardTriggerDropdownMenuProps> = ({
  taskboard
}) => {

  const setRenameTaskboardDialog = useDialogsStore(state => state.setRenameTaskboardDialog)
  const setTaskboardTaskTrashSheet = useDialogsStore(state => state.setTaskboardTaskTrashSheet)
  const setDropTaskboardDialog = useDialogsStore(state => state.setDropTaskboardDialog)
  const setDeactivateTaskboardDialog = useDialogsStore(state => state.setDeactivateTaskboardDialog)

  const handleOpenRenameTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setRenameTaskboardDialog( taskboard, true )
  }

  const handleOpenTrashTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setTaskboardTaskTrashSheet(true)
  }

  const handleOpenDropTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDropTaskboardDialog( taskboard, true )
  }

  const handleOpenDeactivateTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDeactivateTaskboardDialog( taskboard, true )
  }

  return (
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
  )

}