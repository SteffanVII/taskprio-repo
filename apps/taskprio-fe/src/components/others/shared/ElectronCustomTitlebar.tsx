import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useElectronStore_windowMaximize } from "@/stores/electron";
import { Minimize, Slash, SquareIcon, X } from "lucide-react";


const ElectronCustomTitlebar = () => {

    const windowMaximized = useElectronStore_windowMaximize()

    const handleCloseWindow = () => {
        const electronApi = window.electronAPI;
        if ( electronApi ) electronApi.closeWindow()
    }
    const handleMaximizeWindow = () => {
        const electronApi = window.electronAPI;
        if ( electronApi ) electronApi.maximizeWindow()
    }
    const handleUnmaximizeWindow = () => {
        const electronApi = window.electronAPI;
        if ( electronApi ) electronApi.unmaximizeWindow()
    }

    const handleMinimizeWindow = () => {
        const electronApi = window.electronAPI;
        if ( electronApi ) electronApi.minimizeWindow()
    }

    return (
        <div
            className={cn(
                `fixed top-0 z-10`,
                `w-full h-[2.4rem] pl-4`,
                `grid items-start justify-between`,
                `bg-sidebar`
            )}
            style={{
                gridTemplateColumns : "1fr min-content"
            }}
        >
            <div className="electron-custom-titlebar-drag-area size-full flex gap-2 items-center" >
                <p className="text-xs font-bold" >Taskprio</p>
            </div>
            <div className="flex flex-start" >
                <Tooltip>
                    <TooltipTrigger
                        delay={1000}
                        render={
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                className={cn(
                                    `!size-[2.3rem] !w-[3rem] !p-0 !rounded-none`
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
                                    `!size-[2.3rem] !w-[3rem] !p-0 !rounded-none`
                                )}
                                onClick={() => {
                                    if ( windowMaximized ) {
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
                                    `!size-[2.3rem] !w-[3rem] !p-0 !rounded-none`,
                                    `!hover:bg-destructive !hover:text-destructive-foreground`
                                )}
                                onClick={handleCloseWindow}
                            ><X className="size-[1rem]" /></Button>
                        }
                    />
                    <TooltipContent>Close</TooltipContent>
                </Tooltip>
            </div>
        </div>
    )

}

export default ElectronCustomTitlebar;