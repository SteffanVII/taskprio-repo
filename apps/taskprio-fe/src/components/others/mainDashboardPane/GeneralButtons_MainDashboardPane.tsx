import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace } from "@/stores/globals";
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
    const selectedWorkpace = useGlobalsStore_selectedWorkspace()

    const taskTodoOnClick = () => {
        navigate(`/p/w/${workspace_id}/tt`)
        updateGlobalsStore({
            noProjects : false,
            selectedProject : null,
            selectedTaskboard : null,
            selectedTask : null
        })
        if ( project_id ) {
            channelActions.leaveProjectChannel(project_id)
        }
        if ( task_board_id ) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }
    
    const workspaceSettingsOnClick = () => {
        navigate(`/p/w/${workspace_id}/workspace_settings`)
        updateGlobalsStore({
            noProjects : false,
            selectedProject : null,
            selectedTaskboard : null,
            selectedTask : null
        })
        if ( project_id ) {
            channelActions.leaveProjectChannel(project_id)
        }
        if ( task_board_id ) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }
    
    const statisticsOnClick = () => {
        navigate(`/p/w/${workspace_id}/statistics`)
        updateGlobalsStore({
            noProjects : false,
            selectedProject : null,
            selectedTaskboard : null,
            selectedTask : null
        })
        if ( project_id ) {
            channelActions.leaveProjectChannel(project_id)
        }
        if ( task_board_id ) {
            channelActions.leaveTaskboardChannel(task_board_id)
        }
    }

    return (
        <div
            className={cn(
                ` flex flex-col `
            )}
        >
            <Button
                size={"lg"}
                variant={ pathname.includes("/statistics") ? "secondary" : "ghost" }
                className={cn(
                    `relative border-0 w-full justify-start gap-4 rounded-none `
                )}
                onClick={statisticsOnClick}
                disabled={!selectedWorkpace}
            >
                <ChartSpline/>
                Reports
                {
                    pathname.includes("/statistics") &&
                    <div
                        className="absolute top-0 right-0 w-2 h-full bg-primary"
                    ></div>
                }
            </Button>
            <Button
                size={"lg"}
                variant={ pathname.includes("/workspace_settings") ? "secondary" : "ghost" }
                className={cn(
                    `relative border-0 w-full justify-start gap-4 rounded-none `,
                )}
                onClick={workspaceSettingsOnClick}
                disabled={!selectedWorkpace}
            >
                <Settings2/>
                Workspace Settings
                {
                    pathname.includes("/workspace_settings") &&
                    <div
                        className="absolute top-0 right-0 w-2 h-full bg-primary"
                    ></div>
                }
            </Button>
            <Button
                size={"lg"}
                variant={ pathname.includes("/tt") ? "secondary" : "ghost" }
                className={cn(
                    `relative border-0 w-full justify-start gap-4 rounded-none `,
                )}
                onClick={taskTodoOnClick}
                disabled={!selectedWorkpace}
            >
                <Notebook/>
                Todo
                {
                    pathname.includes("/tt") &&
                    <div
                        className="absolute top-0 right-0 w-2 h-full bg-primary"
                    ></div>
                }
            </Button>
        </div>
    )

}

export default GeneralButtons;