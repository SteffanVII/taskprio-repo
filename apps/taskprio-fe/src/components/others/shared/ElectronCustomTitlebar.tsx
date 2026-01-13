import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useElectronStore_windowMaximize } from "@/stores/electron";
import { Minimize, Slash, SquareIcon, X } from "lucide-react";
import TaskboardList from "../taskboard/TaskboardList";
import { useContext, useMemo } from "react";
import { useLocation } from "react-router";
import { useGlobalsStore_authenticated } from "@/stores/globals";
import { useTaskboardStore_taskboards } from "@/stores/taskboard";
import { useProjectStore_selectedProject } from "@/stores/project";
import TaskTodoPageHeader from "../taskTodo/TaskTodoPageHeader";
import { WebSocketContext } from "../websocket/WebsocketProvider";


const ElectronCustomTitlebar = () => {

    const { pathname } = useLocation()

    const authenticated = useGlobalsStore_authenticated()
    const windowMaximized = useElectronStore_windowMaximize()
    const selectedProject = useProjectStore_selectedProject()
    const taskboards = useTaskboardStore_taskboards()

    const {
        connected: webSocketConnected,
    } = useContext(WebSocketContext)

    const showTaskboardList = useMemo(() => {
        return authenticated && webSocketConnected && pathname.includes("/p") && selectedProject && pathname.includes("/d") && !pathname.includes("/project_settings") && taskboards && taskboards.length > 0
    }, [
        pathname,
        selectedProject,
        taskboards
    ])

    const showTaskTodoPageHeader = useMemo(() => {
        return authenticated && webSocketConnected && pathname.includes("/p") && pathname.includes("/tt")
    }, [
        pathname
    ])

    const tabOccupied = useMemo(() => {
        return showTaskboardList || showTaskTodoPageHeader
    }, [
        showTaskboardList,
        showTaskTodoPageHeader
    ])

    const handleCloseWindow = () => {
        const electronApi = window.electronAPI;
        if (electronApi) electronApi.closeWindow()
    }
    const handleMaximizeWindow = () => {
        const electronApi = window.electronAPI;
        if (electronApi) electronApi.maximizeWindow()
    }
    const handleUnmaximizeWindow = () => {
        const electronApi = window.electronAPI;
        if (electronApi) electronApi.unmaximizeWindow()
    }

    const handleMinimizeWindow = () => {
        const electronApi = window.electronAPI;
        if (electronApi) electronApi.minimizeWindow()
    }

    return (
        <div
            className={cn(
                `fixed top-0 z-[50]`,
                `w-full h-[3rem]`,
                `grid items-start justify-between`,
                `bg-secondary border-b`
            )}
            style={{
                gridTemplateColumns: "min-content 1fr min-content"
            }}
        >

            <div className="electron-custom-titlebar-drag-area flex items-center h-full px-4 w-[22rem]" >
                <p className="font-bold" >Taskprio</p>
            </div>

            {
                showTaskboardList &&
                <TaskboardList />
            }
            {
                showTaskTodoPageHeader &&
                <TaskTodoPageHeader />
            }
            {
                !tabOccupied &&
                <div className="electron-custom-titlebar-drag-area size-full" />
            }

            <div className=" w-[10rem] h-full grid grid-cols-3 items-center z-50" >
                <Tooltip>
                    <TooltipTrigger
                        delay={1000}
                        render={
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                className={cn(
                                    `border-none !size-full !p-0 !rounded-none`
                                )}
                                onClick={handleMinimizeWindow}
                            ><Slash className="rotate-45 size-[0.6rem]" /></Button>
                        }
                    />
                    <TooltipContent>Minimize</TooltipContent>
                </Tooltip>
                <Tooltip  >
                    <TooltipTrigger
                        delay={1000}
                        render={
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                className={cn(
                                    `border-none !size-full !p-0 !rounded-none`
                                )}
                                onClick={() => {
                                    if (windowMaximized) {
                                        handleUnmaximizeWindow()
                                    } else {
                                        handleMaximizeWindow()
                                    }
                                }}
                            >
                                {
                                    windowMaximized ?
                                        <Minimize className="size-[0.9rem]" />
                                        :
                                        <SquareIcon className="size-[0.9rem]" />
                                }
                            </Button>
                        }
                    />
                    <TooltipContent>
                        {
                            windowMaximized ?
                                "Unmaximize"
                                :
                                "Maximize"
                        }
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger
                        delay={1000}
                        render={
                            <Button
                                variant={"destructive"}
                                size={"icon-sm"}
                                className={cn(
                                    `border-none !size-full !p-0 !rounded-none`,
                                    `!hover:bg-destructive !hover:text-destructive-foreground`
                                )}
                                onClick={handleCloseWindow}
                            ><X className="size-[1rem]" /></Button>
                        }
                    />
                    <TooltipContent>Close</TooltipContent>
                </Tooltip>
            </div>
            {/* <div
                className={cn(
                    `absolute size-full h-[3rem]`,
                    `bg-gradient-to-b from-secondary to-background/20 -z-1`,
                )}
            ></div> */}
        </div>
    )

}

export default ElectronCustomTitlebar;