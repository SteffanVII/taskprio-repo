import { ChartSpline, Notebook, Settings2 } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { WebSocketContext } from "../websocket/WebsocketProvider";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useProjectStore } from "@/stores/project";
import { useGlobalsStore } from "@/stores/globals";
import { useTaskboardStore } from "@/stores/taskboard";

const GeneralButtons = () => {

  const { workspace_id, project_id, taskboard_id } = useParams({
    strict: false
  })
  const { pathname } = useLocation()

  const {
    channelActions
  } = useContext(WebSocketContext)

  const navigate = useNavigate()

  const setNoProjects = useProjectStore(state => state.setNoProjects)
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)

  const resetStates = () => {
    setNoProjects(false)
    setSelectedProject(null)
    setSelectedTask(null)
    setSelectedTaskboard(null)
  }

  // const taskTodoOnClick = () => {
  //   // navigate(`/p/w/${workspace_id}/tt`)
  //   navigate({
  //     to : "/workspace/$workspace_id",
  //     params : {
  //       workspace_id: workspace_id!
  //     }
  //   })
  //   resetStates()
  //   if (project_id) {
  //     channelActions.leaveProjectChannel(project_id)
  //   }
  //   if (taskboard_id) {
  //     channelActions.leaveTaskboardChannel(taskboard_id)
  //   }
  // }

  const workspaceSettingsOnClick = () => {
    navigate({
      to: "/workspace/$workspace_id/workspaceSettings",
      params : {
        workspace_id: workspace_id!
      }
    })
    resetStates()
    if (project_id) {
      channelActions.leaveProjectChannel(project_id)
    }
    if (taskboard_id) {
      channelActions.leaveTaskboardChannel(taskboard_id)
    }
  }

  // const statisticsOnClick = () => {
  //   // navigate(`/p/w/${workspace_id}/statistics`)
  //   resetStates()
  //   if (project_id) {
  //     channelActions.leaveProjectChannel(project_id)
  //   }
  //   if (taskboard_id) {
  //     channelActions.leaveTaskboardChannel(taskboard_id)
  //   }
  // }

  const generalButtons = [
    // {
    //   title: "Reports",
    //   path: "/statistics",
    //   icon: <ChartSpline />,
    //   onclick: statisticsOnClick
    // },
    // {
    //   title: "Todo",
    //   path: "/tt",
    //   icon: <Notebook />,
    //   onclick: taskTodoOnClick
    // },
    {
      title: "Workspace Settings",
      path: "/workspaceSettings",
      icon: <Settings2 />,
      onclick: workspaceSettingsOnClick
    },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            generalButtons.map( button => (
              <SidebarMenuItem key={button.title} >
                <SidebarMenuButton isActive={pathname.includes(button.path)} onClick={button.onclick} >{button.icon} {button.title}</SidebarMenuButton>
              </SidebarMenuItem>
            ) )
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

}

export default GeneralButtons;