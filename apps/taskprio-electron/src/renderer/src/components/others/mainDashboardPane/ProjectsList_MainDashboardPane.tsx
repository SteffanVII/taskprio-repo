import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { useProjectStore, useProjectStore_noProjects, useProjectStore_selectedProject } from "@/stores/project"
import { useWorkspaceStore_workspaceRole } from "@/stores/workspace"

import { EProjectRole, EWorkspaceRole, TProject } from "@repo/taskprio-types"
import { Plus, Settings2 } from "lucide-react"
import { useContext, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "@tanstack/react-router"
import { WebSocketContext } from "../websocket/WebsocketProvider"
import { useGetUserWorkspaces } from "@/services/private/workspace/query"
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query"
import { useTaskboardStore } from "@/stores/taskboard"
import { useDialogsStore } from "@/stores/dialogs"
import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const ProjectsList_MainDashboardPane = () => {

  const navigate = useNavigate()
  const { workspace_id } = useParams({ strict: false })
  const { pathname } = useLocation()
  const {
    channelActions
  } = useContext(WebSocketContext)

  const user = useGlobalsStore_user()
  const workspaceRole = useWorkspaceStore_workspaceRole()
  const selectedProject = useProjectStore_selectedProject()
  const noProjects = useProjectStore_noProjects()
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setProjectRole = useProjectStore(state => state.setProjectRole)
  const setNoProjects = useProjectStore(state => state.setNoProjects)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)
  const setCreateProjectDialog = useDialogsStore(state => state.setCreateProjectDialog)

  const {
    isLoading: workspacesIsLoading
  } = useGetUserWorkspaces()

  const {
    data: projects,
    isLoading: projectsIsLoading
  } = useGetUserProjectsByWorkspace()

  const showSkeleton = useMemo(() => {
    return (projectsIsLoading || workspacesIsLoading)
  }, [projectsIsLoading, workspacesIsLoading])

  const showNoProjectsState = useMemo(() => {
    return (!projectsIsLoading && !workspacesIsLoading && noProjects)
  }, [projectsIsLoading, workspacesIsLoading, noProjects])

  const showProjectsButtons = useMemo(() => {
    return (!projectsIsLoading && !workspacesIsLoading && !!projects)
  }, [projectsIsLoading, workspacesIsLoading, projects])

  const handleProjectButtonOnClick = (project: TProject) => {
    const projectRole: EProjectRole | null = project.project_members.find(member => member.user_id === user?.user_id)?.project_role ?? null
    setSelectedProject(project)
    setProjectRole(projectRole)
    setNoProjects(false)
    setSelectedTask(null)
    setSelectedTaskboard(null)
    setNoTaskboards(false)
    if (selectedProject?.project_id === project.project_id) {
      if (pathname.includes("/project_settings")) {
        // navigate(`/p/w/${workspace_id}/d/${project.project_id}/t`)
        navigate({
          to: "/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id",
          params: {
            workspace_id: workspace_id!,
            project_id: project.project_id,
            taskboard_id: project.project_id
          }
        })
      }
    } else {
      // navigate(`/p/w/${workspace_id}/d/${project.project_id}/t`)
      navigate({
        to: "/workspace/$workspace_id/project/$project_id",
        params: {
          workspace_id: workspace_id!,
          project_id: project.project_id,
          // taskboard_id : project.project_id
        }
      })
    }
    localStorage.setItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, project.project_id)
    channelActions.joinProjectChannel(project.project_id)

  }

  const handleCreateProjectButtonOnClick = () => {
    setCreateProjectDialog(true)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          Projects
        </SidebarGroupLabel>
        <SidebarGroupAction
          onClick={handleCreateProjectButtonOnClick}
        >
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            {
              showSkeleton &&
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={cn(
                    `w-full h-[2rem]`
                  )}
                />
              ))
            }
            {
              showNoProjectsState &&
              <p className="font-bold text-center py-[1rem]" >No Projects Found</p>
            }
            {
              showProjectsButtons &&
              projects!.map(project => (
                <SidebarMenuItem
                  key={project.project_id}
                >
                  <SidebarMenuButton
                    isActive={selectedProject?.project_id === project.project_id}
                    onClick={() => handleProjectButtonOnClick(project)}
                  >{project.project_name}</SidebarMenuButton>
                </SidebarMenuItem>
              ))
            }
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )

}

export default ProjectsList_MainDashboardPane;