import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { taskSectionColors } from "@/lib/utils/shared"
import { useUpdateTaskboardSection } from "@/services/private/tasksection/mutation"
import { TTaskSectionWithTasks } from "@repo/taskprio-types/src"
import { Ellipsis, Pencil } from "lucide-react"
import React from "react"

type TTaskboardSectionMenuProps = {
    taskSection : TTaskSectionWithTasks,
    openRenameModal : () => void
}

export const TaskboardSectionMenu : React.FC<TTaskboardSectionMenuProps> = ({
    taskSection,
    openRenameModal
}) => {

    const {
        mutate : updateTaskboardSection
    } = useUpdateTaskboardSection()

    const onColorChange = ( color : string ) => {
        updateTaskboardSection({
            task_section_id : taskSection.task_section_id,
            body : {
                task_section_color : color
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className=" size-8 "
                    >
                        <Ellipsis className=" size-4 " />
                    </Button>
                }
            />
            <DropdownMenuContent>
                <DropdownMenuItem
                    className=" flex items-center gap-2 "
                    onClick={openRenameModal}
                >
                    Rename
                    <Pencil className=" size-4 ml-auto " />
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        Color
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {
                            taskSectionColors.map( ( color ) => (
                                <DropdownMenuItem
                                    key={color}
                                    className={cn(
                                        " flex items-center gap-2 ",
                                        taskSection.task_section_color === color && " bg-foreground/10 "
                                    )}
                                    onClick={() => onColorChange( color )}
                                >
                                    <div className=" size-4 w-full rounded-sm" style={{ backgroundColor : color }}></div>
                                    {/* {color} */}
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}

export default TaskboardSectionMenu;