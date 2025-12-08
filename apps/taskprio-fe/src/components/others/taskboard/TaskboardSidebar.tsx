import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { createContext, useState } from "react";
import TaskboardTrashSheet from "./TaskboardTrashSheet";

type TTaskboardSidebarContext = {
    openTrashSheet : boolean,
    setOpenTrashSheet : ( value : boolean ) => void
}

export const TaskboardSidebarContext = createContext<TTaskboardSidebarContext>({
    openTrashSheet : false,
    setOpenTrashSheet : () => {}
})

const TaskboardSidebar = () => {

    const [ openTrashSheet, setOpenTrashSheet ] = useState<boolean>(false)

    return (
        <TaskboardSidebarContext.Provider
            value={{
                openTrashSheet,
                setOpenTrashSheet
            }}
        >
            <div
                className={cn(
                    `relative flex flex-col items-center py-2`,
                    `w-[3rem] h-full min-w-0 min-h-0`,
                    `bg-background`
                    // `bg-background border-l`
                )}
            >
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            size={"icon"}
                            variant={"ghost"}
                            onClick={() => {
                                setOpenTrashSheet(true)
                            }}
                        >
                            <Trash/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="left"
                    >
                        Trash
                    </TooltipContent>
                </Tooltip>
            </div>
            <TaskboardTrashSheet/>
        </TaskboardSidebarContext.Provider>
    )

}

export default TaskboardSidebar;