import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGlobalsStore_user } from "@/stores/globals";
import { useWorkspaceStore, useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";

import { House, MessageCircleWarningIcon, Plus } from "lucide-react";
import { useContext, useState } from "react";
import { EWorkspaceRole, TWorkspace } from "@repo/taskprio-types";
import { useTaskTodoPageStore_sessionActive } from "@/stores/taskTodoPage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { WebSocketContext } from "../websocket/WebsocketProvider";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { useProjectStore } from "@/stores/project";
import { useTaskboardStore } from "@/stores/taskboard";
import { useDialogsStore } from "@/stores/dialogs";
import { Separator } from "@/components/ui/separator";

const ignoreTodoSessionIsActiveLocalStorageName = import.meta.env.VITE_IGNORE_TODO_SESSION_IS_ACTIVE_WARNING_LOCAL_STORAGE_NAME;

type TTodoSessionActiveWarning = {
  state: boolean,
  workspace: TWorkspace | null
}

const WorkspaceDropdown_MainDashboardPane = () => {

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const {
    channelActions
  } = useContext(WebSocketContext)

  const {
    handlePauseSession,
    invalidateUseGetUserTaskTodoState
  } = useContext(StateManager_TaskTodoPageContext)

  const sessionActive = useTaskTodoPageStore_sessionActive()

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const user = useGlobalsStore_user()
  const setSelectedWorkspace = useWorkspaceStore(state => state.setSelectedWorkspace);
  const setNoWorkspaces = useWorkspaceStore(state => state.setNoWorkspaces)
  const setWorkspaceRole = useWorkspaceStore(state => state.setWorkspaceRole)
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setNoProjects = useProjectStore(state => state.setNoProjects)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)
  const setCreateWorkspaceDialog = useDialogsStore(state => state.setCreateWorkspaceDialog)

  const {
    data : workspaces,
    isLoading : workspacesIsLoading
  } = useGetUserWorkspaces()

  const [showTodoSessionIsActiveWarning, setTodoSessionIsActiveWarning] = useState<TTodoSessionActiveWarning>({
    state: false,
    workspace: null
  })
  const [ignoreTodoSessionActiveWarning, setIgnoreTodoSessionActiveWarning] = useState<boolean>(Boolean(localStorage.getItem(ignoreTodoSessionIsActiveLocalStorageName + "_" + user?.user_id)) || false)

  const handleWorkspaceOnClick = (workspace: TWorkspace) => {
    if (selectedWorkspace?.workspace_id === workspace.workspace_id) return
    if (sessionActive && !ignoreTodoSessionActiveWarning) {
      setTodoSessionIsActiveWarning({
        state: true,
        workspace
      })
      return
    }
    handleWorkspaceNavigate(workspace)
  }

  const handleNavigateAnywayOnClick = () => {
    if (showTodoSessionIsActiveWarning.workspace && showTodoSessionIsActiveWarning.state === true) {
      handleWorkspaceNavigate(showTodoSessionIsActiveWarning.workspace)
      setTodoSessionIsActiveWarning({
        state: false,
        workspace: null
      })
    }
  }

  const handleWorkspaceNavigate = (workspace: TWorkspace) => {
    if (sessionActive) {
      handlePauseSession()
      invalidateUseGetUserTaskTodoState()
    }
    const workspaceRole: EWorkspaceRole | null = workspace.workspace_members.find(member => member.user_id === user?.user_id)?.workspace_role ?? null
    setSelectedWorkspace(workspace)
    setWorkspaceRole(workspaceRole)
    setNoWorkspaces(false)
    setSelectedProject(null)
    setNoProjects(false)
    setSelectedTaskboard(null)
    setNoTaskboards(false)
    if (pathname.includes("/tt")) {
      // navigate(`/p/w/${workspace.workspace_id}/tt`)
    }
    else if (pathname.includes("/workspaceSettings")) {
      // navigate(`/p/w/${workspace.workspace_id}/workspace_settings`)
      navigate({
        to : "/workspace/$workspace_id/workspaceSettings",
        params : {
          workspace_id : workspace.workspace_id
        }
      })
    } else {
      navigate({
        to : "/workspace/$workspace_id",
        params : {
          workspace_id : workspace.workspace_id
        }
      })
    }
    localStorage.setItem(import.meta.env.VITE_LAST_WORKSPACE_VISTED_COOKIE_NAME!, workspace.workspace_id)
    channelActions.joinWorkspaceChannel(workspace.workspace_id)
  }

  const handleIgnoreTodoSessionActiveWarningCheckbox = (value: boolean) => {
    setIgnoreTodoSessionActiveWarning(value)
    localStorage.setItem(ignoreTodoSessionIsActiveLocalStorageName + "_" + user?.user_id, value ? "true" : "false")
  }

  return (
    <>
      <Popover>
        <PopoverTrigger
          render={
            <div
              className={cn(
                `h-[2.6rem]`,
                `text-sidebar-foreground px-3 py-2 rounded-md`,
                `cursor-pointer flex gap-4 items-center justify-between`,
                `hover:bg-muted`
              )}
            >
              {
                (workspacesIsLoading) ?
                  <Skeleton className="bg-primary/20 w-[16rem] h-[1.8rem]" />
                  :
                  <>
                    {
                      (workspaces && workspaces?.length === 0) &&
                      <p className=" text-center text-muted-foreground" >No Workspaces Found</p>
                    }
                    <p
                      className={cn(
                        " max-w-[16rem] truncate ",
                        " font-semibold "
                      )}
                      title={selectedWorkspace?.workspace_name}
                    >{selectedWorkspace?.workspace_name}</p>
                  </>
              }
              <House className="shrink-0 size-4" />
            </div>
          }
        >
        </PopoverTrigger>
        <PopoverContent
          className=" w-[20rem] gap-2 overflow-hidden"
          side="right"
          >
          <PopoverHeader>
            <PopoverTitle>Workspaces</PopoverTitle>
            <PopoverDescription>Select current workspace</PopoverDescription>
          </PopoverHeader>
          <Separator/>
          <div
            className={cn(
              ` flex flex-col gap-2 `
            )}
          >
            <div
              className={cn(
                ` flex flex-col overflow-hidden `
              )}
            >
              {
                (workspaces && workspaces?.length === 0) &&
                <p className="text-center font-bold" >No Workspaces Found</p>
              }
              {
                workspaces?.map(workspace => (
                  <Button
                    key={workspace.workspace_id}
                    size={"lg"}
                    variant={selectedWorkspace?.workspace_id === workspace.workspace_id ? "default" : "ghost"}
                    className=" justify-between gap-2 "
                    onClick={() => handleWorkspaceOnClick(workspace)}
                  >
                    {workspace.workspace_name}
                  </Button>
                ))
              }
            </div>
            {/* <Separator /> */}
            <Button
              variant={"secondary"}
              onClick={() => {
                setCreateWorkspaceDialog(true)
              }}
              // className={cn(
              //   " p-2 ",
              //   " flex justify-center items-center gap-2 rounded-b-md ",
              //   " text-sm ",
              //   " hover:bg-muted-foreground/10 active:bg-muted-foreground/20 "
              // )}
            >Create New Workspace <Plus className="size-4" /></Button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog
        open={showTodoSessionIsActiveWarning.state}
        onOpenChange={open => {
          if (!open) {
            setTodoSessionIsActiveWarning({
              state: false,
              workspace: null
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center" ><MessageCircleWarningIcon /> Todo timer is currently running</DialogTitle>
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