import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { updateGlobalsStore } from "@/stores/globals";
import { updateProjectStore } from "@/stores/project";
import { updateTaskboardStore } from "@/stores/taskboard";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { ChartSpline, Notebook, Settings2 } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { WebSocketContext } from "../websocket/WebsocketProvider";

const GeneralButtons = () => {

    const { workspace_id, project_id, task_board_id } = useParams()
    const { pathname } = useLocation()
    const {
        channelActions
    } = useContext(WebSocketContext)

    const navigate = useNavigate()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const taskTodoOnClick = () => {
        navigate(`/p/w/${workspace_id}/tt`)
        updateProjectStore({
            noProjects: false,
            selectedProject: null,
        })
        updateGlobalsStore({
            selectedTask: null
        })
        updateTaskboardStore({
            selectedTaskboard: null
        })
        if (project_id) {
            channelActions.leaveProjectChannel(project_id)
        }
        if (task_board_id) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }

    const workspaceSettingsOnClick = () => {
        navigate(`/p/w/${workspace_id}/workspace_settings`)
        updateProjectStore({
            noProjects: false,
            selectedProject: null,
        })
        updateGlobalsStore({
            selectedTask: null
        })
        updateTaskboardStore({
            selectedTaskboard: null
        })
        if (project_id) {
            channelActions.leaveProjectChannel(project_id)
        }
        if (task_board_id) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }

    const statisticsOnClick = () => {
        navigate(`/p/w/${workspace_id}/statistics`)
        updateProjectStore({
            noProjects: false,
            selectedProject: null,
        })
        updateGlobalsStore({
            selectedTask: null
        })
        updateTaskboardStore({
            selectedTaskboard: null
        })
        if (project_id) {
            channelActions.leaveProjectChannel(project_id)
        }
        if (task_board_id) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }

    const generalButtons = [
        {
            title : "Reports",
            path : "/statistics",
            icon : <ChartSpline />,
            onclick : statisticsOnClick
        },
        {
            title : "Workspace Settings",
            path : "/workspace_settings",
            icon : <Settings2 />,
            onclick : workspaceSettingsOnClick
        },
        {
            title : "Todo",
            path : "/tt",
            icon : <Notebook />,
            onclick : taskTodoOnClick
        }
    ]

    return (
        <div
            className={cn(
                ` flex flex-col p-2 `
            )}
        >
            {
                generalButtons.map( button => (
                    <Button
                        key={button.path}
                        size={"lg"}
                        variant={pathname.includes(button.path) ? "secondary" : "ghost"}
                        className={cn(
                            `relative w-full justify-start gap-4 border-0 `,
                            pathname.includes(button.path) && ` bg-primary/20 hover:bg-primary/15 transition-colors duration-500`
                        )}
                        onClick={button.onclick}
                        disabled={!selectedWorkspace}
                    >
                        {button.icon}
                        {button.title}
                    </Button>
                ) )
            }
        </div>
    )

}

export default GeneralButtons;