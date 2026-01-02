import { cn } from "@/lib/utils"
import { TTaskForCardView } from "@repo/taskprio-types/src/index"
import { useGlobalsStore_selectedTask } from "@/stores/globals"
import { updateTaskboardDragStore } from "@/stores/taskboardDrag"

import { useNavigate, useParams } from "react-router"
import TaskAssigner from "../shared/task/TaskAssigner"
import { useLayoutEffect, useMemo, useState } from "react"
import TagBadge from "../shared/tag/TagBadge"
import { BookTypeIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import React from "react"

export type TTaskboardTaskProps = {
    task : TTaskForCardView,
}

export const TaskboardTask : React.FC<TTaskboardTaskProps> = ( {
    task
} ) => {

    const {
        task_board_slug,
        task_id
    } = useParams()

    const selectedTask = useGlobalsStore_selectedTask()

    const navigate = useNavigate()

    const [ taskTitle, setTaskTitle ] = useState<string>(task.task_title)

    const [ mainKey, setMainKey ] = useState( 0)
    const [ assignees, setAssignees ] = useState<string[]>( task.assignees.map( assignee => assignee.user_id ) )

    const [ showTaskAssigner, setShowTaskAssigner ] = useState<boolean>(false)

    const onClickHandler = () => {
        navigate( task_id ? `../t/${task_board_slug}/${task.task_id}` : `${task.task_id}`, { replace : true } )
    }

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateTaskboardDragStore({
            taskboardTaskDrag : {
                taskboardTask : task
            }
        })
    }

    const onDragEndHandler = () => {
        console.log("DragEnd");
        updateTaskboardDragStore({
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
    }, [])

    useLayoutEffect(() => {
        if ( selectedTask && selectedTask.task_id === task.task_id ) {
            if ( selectedTask.task_title !== taskTitle ) {
                setTaskTitle(selectedTask.task_title)
            }
        }
    }, [selectedTask])

    useLayoutEffect(() => {
        setAssignees( task.assignees.map( assignee => assignee.user_id ) )
    }, [task])

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            setShowTaskAssigner(true)
        }, 300 )
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    return (
        <div
            key={mainKey}
            className={cn(
                `w-[20rem] min-w-[20rem] h-fit `,
                `bg-card border border-border transition-colors duration-500 shadow `,
                `rounded-md`,
                `hover:border-primary`,
                `pointer-events-auto`,
                
            )}
            draggable={true}
            onDragStart={ onDragStartHandler }
            onDragEnd={ onDragEndHandler }
            onMouseDown={ onMouseDownHandler }
            onClick={ onClickHandler }
        >
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
            >{taskTitle}</p>
            <div
                className={` flex justify-end px-3 pb-3 min-h-[2.6rem] h-fit `}
            >
                {
                    showTaskAssigner &&
                    <div className=" animate-in fade-in duration-300" >
                        <TaskAssigner
                            task_id={task.task_id}
                            assignees={assignees}
                            onAssigneesChange={setAssignees}
                            disabledHoverCard
                        />
                    </div>
                }
            </div>
            {
                task.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 `,
                            ` m-2 `
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

export default React.memo(TaskboardTask)