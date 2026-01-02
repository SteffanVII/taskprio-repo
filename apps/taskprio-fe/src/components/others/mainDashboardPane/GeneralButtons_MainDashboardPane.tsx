import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { ChartSpline, Notebook, Settings2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";

const GeneralButtons = () => {

    const { workspace_id } = useParams()
    const { pathname } = useLocation()

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
    }
    
    const workspaceSettingsOnClick = () => {
        navigate(`/p/w/${workspace_id}/workspace_settings`)
        updateGlobalsStore({
            noProjects : false,
            selectedProject : null,
            selectedTaskboard : null,
            selectedTask : null
        })
    }
    
    const statisticsOnClick = () => {
        navigate(`/p/w/${workspace_id}/statistics`)
        updateGlobalsStore({
            noProjects : false,
            selectedProject : null,
            selectedTaskboard : null,
            selectedTask : null
        })
    }

    return (
        <div
            className={cn(
                ` flex flex-col gap-1 px-2 py-4 `
            )}
        >
            <Button
                size={"sm"}
                variant={ pathname.includes("/statistics") ? "default" : "ghost" }
                className={cn(
                    ` w-full justify-start gap-4 `,
                )}
                onClick={statisticsOnClick}
                disabled={!selectedWorkpace}
            >
                <ChartSpline/>
                Dashboard
            </Button>
            <Button
                size={"sm"}
                variant={ pathname.includes("/workspace_settings") ? "default" : "ghost" }
                className={cn(
                    ` w-full justify-start gap-4 `,
                )}
                onClick={workspaceSettingsOnClick}
                disabled={!selectedWorkpace}
            >
                <Settings2/>
                Workspace Settings
            </Button>
            <Button
                size={"sm"}
                variant={ pathname.includes("/tt") ? "default" : "ghost" }
                className={cn(
                    ` w-full justify-start gap-4 `,
                )}
                onClick={taskTodoOnClick}
                disabled={!selectedWorkpace}
            >
                <Notebook/>
                Todo
            </Button>
        </div>
    )

}

export default GeneralButtons;