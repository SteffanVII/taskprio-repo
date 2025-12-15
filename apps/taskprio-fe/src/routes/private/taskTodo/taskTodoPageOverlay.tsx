import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FlipVerticalIcon } from "lucide-react";



const TaskTodoPageOverlay = () => {

    return (
        <div
            className={cn(
                ` size-full min-w-0 min-h-0 overflow-hidden `,
                ` flex flex-col grow `,
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    `flex justify-between `,
                    ` p-4 `
                )}
            >
                <div
                    className={cn(
                        `flex gap-4`
                    )}
                >
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Workspace" />
                        </SelectTrigger>
                    </Select>
                </div>
                <div
                    className={cn(
                        `flex gap-4`
                    )}
                >
                    <Tooltip>
                        <TooltipTrigger asChild >
                            <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                            >
                                <FlipVerticalIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Focus Mode</TooltipContent>
                    </Tooltip>
                </div>
            </div>   
        </div>
    )

}

export default TaskTodoPageOverlay;