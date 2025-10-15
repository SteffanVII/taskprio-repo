import { cn } from "@/lib/utils"
import { TTaskForCardView } from "@repo/taskprio-types/src/index"
import { updateGlobalsStore } from "@/stores/globals"
import { useNavigate, useParams } from "react-router"
import TaskAssigner from "../shared/task/TaskAssigner"
import { useLayoutEffect, useMemo, useState } from "react"
import TagBadge from "../shared/tag/TagBadge"
import { BookTypeIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import getHexLuminance from "@/lib/utils/hexColorLuminance"

export type TTaskboardTaskProps = {
    task : TTaskForCardView
}

export const TaskboardTask : React.FC<TTaskboardTaskProps> = ( {
    task
} ) => {

    const {
        task_board_slug,
        task_id
    } = useParams()

    const navigate = useNavigate()

    const [ mainKey, setMainKey ] = useState( 0)
    const [ assignees, setAssignees ] = useState<string[]>( task.assignees.map( assignee => assignee.user_id ) )

    const onClickHandler = () => {
        navigate( task_id ? `../t/${task_board_slug}/${task.task_id}` : `${task.task_id}`, { replace : true } )
    }

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateGlobalsStore({
            taskboardTaskDrag : {
                taskboardTask : task
            }
        })
    }

    const onDragEndHandler = () => {
        updateGlobalsStore({
            taskboardTaskDrag : {
                taskboardTask : null
            }
        })
    }
    
    // IMPORTANT : Prevent the taskboard from being drag scrolled
    const onMouseDownHandler = ( e : React.MouseEvent<HTMLDivElement> ) => {
        e.stopPropagation()
    }

    const hasContent = useMemo(() => {
        return (task.task_description && task.task_description.length > 0)
    }, [task.task_description])

    useLayoutEffect(() => {
        setAssignees( task.assignees.map( assignee => assignee.user_id ) )
        setMainKey( mainKey + 1 )
    }, [task])

    return (
        <div
            key={mainKey}
            className={cn(
                `w-[20rem] min-w-[20rem] h-fit `,
                `bg-background border border-border rounded-2xl transition-colors duration-500 `,
                `hover:border-primary`
            )}
            draggable={true}
            onDragStart={ onDragStartHandler }
            onDragEnd={ onDragEndHandler }
            onMouseDown={ onMouseDownHandler }
            onClick={ onClickHandler }
        >
            {/* <p className="text-right" >{task.display_order}</p> */}
            <div
                className={cn(
                    `flex justify-between`,
                    ` mx-2 mt-2 `,
                )}
            >
                <p
                    className={cn(
                        `w-fit text-xs font-semibold px-2 py-1 rounded-md `,
                        `bg-primary text-primary-foreground`,
                        getHexLuminance(task.project_color) > 0.4 ? `text-black` : `text-white`
                    )}
                    style={{
                        backgroundColor : task.project_color === "#ffffff" ? undefined : task.project_color
                    }}
                >{task.project_abbreviation.toUpperCase()}-{task.task_depth}</p>
                {
                    hasContent && (
                        <Tooltip>
                            <TooltipTrigger>
                                <BookTypeIcon className="text-muted-foreground size-[1rem]" />
                            </TooltipTrigger>
                            <TooltipContent>Has Content</TooltipContent>
                        </Tooltip>
                    )
                }
            </div>
            <p
                className={cn(
                    `font-medium p-3 `
                )}
            >{task.task_title}</p>
            <div
                className={` flex justify-end px-3 pb-3 `}
            >
                <TaskAssigner
                    task_id={task.task_id}
                    assignees={assignees}
                    onAssigneesChange={setAssignees}
                />
            </div>
            {
                task.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 overflow-hidden rounded-bl-[0.3rem] `,
                            ` m-3 `
                        )}
                    >
                        {
                            task.tags.map( tag => (
                                <TagBadge
                                    tag={tag}
                                    key={tag.tag_id}
                                    size="sm"
                                />
                            ) )
                        }
                    </div>
                )
            }
        </div>
    )

}

export default TaskboardTask