import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { useGlobalsStore, useGlobalsStore_user } from "@/stores/globals";
import { useProjectStore, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import React, { useContext, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useTaskboardStore } from "@/stores/taskboard";

type TStateManager_Project = {
  children: React.ReactNode
}

const StateManager_Project: React.FC<TStateManager_Project> = ({ children }) => {

  const navigate = useNavigate()

  const { workspace_id, project_id } = useParams({ strict: false })
  const { pathname } = useLocation()
  const {
    channelActions
  } = useContext(WebSocketContext)

  const user = useGlobalsStore_user()
  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const selectedProject = useProjectStore_selectedProject()
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setProjectRole = useProjectStore(state => state.setProjectRole)
  const setNoProjects = useProjectStore(state => state.setNoProjects)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)

  const {
    data: projects,
    isFetching: projectsIsFetching,
  } = useGetUserProjectsByWorkspace(selectedWorkspace?.workspace_id)

  useEffect(() => {
    setNoProjects((projects && projects.length < 1) ?? false)
  }, [
    projects
  ])

  // If no project_id is selected, navigate to the first project once the projects data are available
  useEffect(() => {
    // Only navigate if the user is not in any of the routes below
    if (
      !pathname.includes("/tt") &&
      !pathname.includes("/workspaceSettings") &&
      !pathname.includes("/task_todo_overlay") &&
      !pathname.includes("/statistics")
    ) {
      if (!project_id) {
        if (projects && projects.length > 0) {
          // Check if the selected workspace is the same as the workspace_id
          // If it's not means the user might have switched workspace and the workspace data hasn't fetched yet
          // This is to prevent fetching the project data that doesn't belong to the selected workspace
          if (selectedWorkspace?.workspace_id === workspace_id) {
            const lastVisitedProjectId = localStorage.getItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME)
            const foundProject = projects.find(project => project.project_id === lastVisitedProjectId) || projects[0]
            localStorage.setItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, foundProject.project_id)
            navigate({
              to: "/workspace/$workspace_id/project/$project_id",
              params: {
                workspace_id: workspace_id!,
                project_id: foundProject.project_id
              }
            })
          }
        }
      }
    }
  }, [
    projects,
    selectedWorkspace,
    project_id,
    workspace_id
  ])

  useEffect(() => {
    if (!selectedProject && project_id) {
      const foundProject = projects?.find(project => project.project_id === project_id) ?? null;
      const projectMemberRole = foundProject?.project_members.find(projectMember => projectMember.user_id === user?.user_id)?.project_role ?? null
      setSelectedProject(foundProject)
      setProjectRole(projectMemberRole)
      setNoProjects(false)
      setSelectedTask(null)
      setSelectedTaskboard(null)
      setNoTaskboards(false)
      if (foundProject) {
        channelActions.joinProjectChannel(foundProject.project_id)
      }
    }
  }, [
    projects,
    project_id
  ])

  // Set noProjects global store state
  useLayoutEffect(() => {
    setNoProjects((projects && !projectsIsFetching && projects.length < 1) ?? false)
  }, [projects, projectsIsFetching])

  return children;

}

export default StateManager_Project;