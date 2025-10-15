import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { updateGlobalsStore } from "@/stores/globals";
import { Settings2, Timer } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";

const GeneralButtons = () => {

    const { workspace_id } = useParams()
    const { pathname } = useLocation()

    const navigate = useNavigate()

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

    return (
        <div
            className={cn(
                ` flex flex-col gap-1 px-2 `
            )}
        >
            <Button
                variant={"ghost"}
                className={cn(
                    ` w-full justify-start gap-4 `,
                    ` hover:bg-border `,
                    pathname.includes("/workspace_settings") && " bg-border !text-primary "
                )}
                onClick={workspaceSettingsOnClick}
            >
                <Settings2/>
                Workspace Settings
            </Button>
            <Button
                variant={"ghost"}
                className={cn(
                    ` w-full justify-start gap-4 `,
                    ` hover:bg-border `,
                    pathname.includes("/tt") && " bg-border !text-primary "
                )}
                onClick={taskTodoOnClick}
            >
                <Timer/>
                My Tasks
            </Button>
        </div>
    )

}

export default GeneralButtons;