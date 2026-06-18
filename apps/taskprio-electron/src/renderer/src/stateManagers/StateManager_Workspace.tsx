import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import { useWorkspaceStore, useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import React, { useContext, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { EWorkspaceRole } from "@repo/taskprio-types";
import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider";
import { useGlobalsStore_user } from "@/stores/globals";
import { useProjectStore } from "@/stores/project";
import { useTaskboardStore } from "@/stores/taskboard";

type TStateManager_Workspace = {
  children: React.ReactNode
}

const StateManager_Workspace: React.FC<TStateManager_Workspace> = ({ children }) => {

  const navigate = useNavigate()

  const { pathname } = useLocation()
  const { workspace_id } = useParams({ strict: false })

  const user = useGlobalsStore_user()
  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const setSelectedWorkspace = useWorkspaceStore(state => state.setSelectedWorkspace)
  const setNoWorkspaces = useWorkspaceStore(state => state.setNoWorkspaces)
  const setWorkspaceRole = useWorkspaceStore(state => state.setWorkspaceRole)
  const setNoProjects = useProjectStore(state => state.setNoProjects)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)

  const {
    channelActions
  } = useContext(WebSocketContext);

  const {
    data: workspaces,
    isFetching: workspacesIsFetching,
  } = useGetUserWorkspaces()

  useEffect(() => {
    setNoWorkspaces((workspaces && workspaces.length < 1) ?? false)
  }, [
    workspaces
  ])

  // If no workspace_id is selected, navigate to the first workspace once the workspaces data are available
  useLayoutEffect(() => {
    // If the user is on the workspace settings page or task todo apge, don't navigate to the first workspace
    if (
      !pathname.includes("/workspaceSettings") &&
      !pathname.includes("/tt") &&
      !pathname.includes("/profile") &&
      !pathname.includes("/task_todo_overlay") &&
      !pathname.includes("/statistics")
    ) {
      if (!workspace_id) {
        console.log("No Workspace Selected");
        if (workspaces && workspaces.length > 0) {
          const lastVisitedWorkspaceId = localStorage.getItem(import.meta.env.VITE_LAST_WORKSPACE_VISTED_COOKIE_NAME)
          const workspaceData = lastVisitedWorkspaceId ? workspaces.find(workspace => workspace.workspace_id === lastVisitedWorkspaceId) || workspaces[0] : workspaces[0];
          localStorage.setItem(import.meta.env.VITE_LAST_WORKSPACE_VISTED_COOKIE_NAME!, workspaceData.workspace_id)
          navigate({
            to: "/workspace/$workspace_id",
            params: {
              workspace_id: workspaceData.workspace_id
            }
          })
        }
      }
    }


  }, [workspaces, workspace_id])

  useLayoutEffect(() => {
    // If selectedWorkspace is null or selectedWorkspace doesn't match the workspace_id
    // Try to find the workspace in workspaces data to be set as selectedWorkspace
    // This doesn't set to other the first workspace if workspace isn't found
    // This is only for when the webapp is loaded already in a workspace route but doesn't have selectedWorkspace data set yet
    if (!selectedWorkspace && workspace_id) {
      const foundWorkspace = workspaces?.find(workspace => workspace.workspace_id === workspace_id) ?? null;
      const workspaceRole: EWorkspaceRole | null = foundWorkspace?.workspace_members.find(member => member.user_id === user?.user_id)?.workspace_role ?? null;
      setSelectedWorkspace(foundWorkspace)
      setWorkspaceRole(workspaceRole)
      setNoProjects(false)
      setNoTaskboards(false)
      if (foundWorkspace) {
        channelActions.joinWorkspaceChannel(foundWorkspace.workspace_id)
      }
    }
  }, [
    workspace_id,
    workspaces,
    selectedWorkspace
  ])

  // Set noWorkspaces global store state
  useLayoutEffect(() => {
    setNoWorkspaces(Boolean(workspaces && !workspacesIsFetching && workspaces.length < 1))
  }, [workspaces, workspacesIsFetching])

  return children

}

export default StateManager_Workspace;