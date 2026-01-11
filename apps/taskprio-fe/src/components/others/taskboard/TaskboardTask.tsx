import { cn } from "@/lib/utils"
import { TTaskForCardView } from "@repo/taskprio-types/src/index"
import { useGlobalsStore_selectedTask } from "@/stores/globals"

import { useNavigate, useParams } from "react-router"
import TaskAssigner from "../shared/task/TaskAssigner"
import { useLayoutEffect, useMemo, useState } from "react"
import TagBadge from "../shared/tag/TagBadge"
import { BookTypeIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { ETaskboardDragDataType } from "./Taskboard"

export type TTaskboardTaskProps = {
    task: TTaskForCardView,
    preview?: boolean,
    dimensionFiller?: boolean
}

export const TaskboardTask: React.FC<TTaskboardTaskProps> = ({
    task,
    preview,
    dimensionFiller
}) => {

    const {
        task_board_slug,
        task_id
    } = useParams()
    const navigate = useNavigate()

    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging
    } = useDraggable({
        id: task.task_id + (preview ? "_preview" : ""),
        data: {
            type: ETaskboardDragDataType.TASK,
            data: task
        },
        disabled: preview
    })

    const selectedTask = useGlobalsStore_selectedTask()

    const [taskTitle, setTaskTitle] = useState<string>(task.task_title)

    const [mainKey, setMainKey] = useState(0)
    const [assignees, setAssignees] = useState<string[]>(task.assignees.map(assignee => assignee.user_id))

    const [showTaskAssigner, setShowTaskAssigner] = useState<boolean>(false)

    const onClickHandler = () => {
        navigate(task_id ? `../t/${task_board_slug}/${task.task_id}` : `${task.task_id}`, { replace: true })
    }

    // IMPORTANT : Prevent the taskboard from being drag scrolled
    const onMouseDownHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    const hasContent = useMemo(() => {
        return (task.task_description && task.task_description.length > 0)
    }, [task.task_description])

    useLayoutEffect(() => {
        setAssignees(task.assignees.map(assignee => assignee.user_id))
        setMainKey(mainKey + 1)
    }, [])

    useLayoutEffect(() => {
        if (selectedTask && selectedTask.task_id === task.task_id) {
            if (selectedTask.task_title !== taskTitle) {
                setTaskTitle(selectedTask.task_title)
            }
        }
    }, [selectedTask])

    useLayoutEffect(() => {
        setAssignees(task.assignees.map(assignee => assignee.user_id))
    }, [task])

    useLayoutEffect(() => {
        if (!showTaskAssigner) {
            setTimeout(() => {
                setShowTaskAssigner(true)
            }, 500)
        }
    }, [showTaskAssigner])

    return (
        <div
            className={cn(
                `group`,
                `size-fit`,
                `bg-muted rounded-md`
            )}
        >
            <div
                ref={setNodeRef}
                key={mainKey}
                className={cn(
                    `w-[20rem] min-w-[20rem] h-fit `,
                    `bg-card border border-border transition-all duration-200 shadow `,
                    `rounded-md`,
                    `hover:border-primary`,
                    `pointer-events-auto`,
                    (isDragging || dimensionFiller) && `opacity-0`
                )}
                {...listeners}
                {...attributes}
                onMouseDown={onMouseDownHandler}
                onClick={onClickHandler}
            >
                <div
                    className={cn(
                        `flex justify-between`,
                        ` mx-2 mt-2 opacity-70 transition-opacity group-hover:opacity-100 `,
                    )}
                >
                    <p
                        className={cn(
                            `w-fit text-xs font-semibold px-2 py-1 rounded `,
                            `bg-primary text-primary-foreground`,
                            getHexLuminance(task.project_color) > 0.4 ? `text-black` : `text-white`
                        )}
                        style={{
                            backgroundColor: task.project_color === "#ffffff" ? undefined : task.project_color
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
                        (!preview || !dimensionFiller) && showTaskAssigner &&
                        <div className=" animate-in fade-in duration-300 opacity-50 transition-opacity group-hover:opacity-100" >
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
                                ` flex flex-wrap gap-2 `,
                                ` m-2 opacity-40 transition-opacity group-hover:opacity-100 `
                            )}
                        >
                            {
                                task.tags.map(tag => (
                                    <TagBadge
                                        tag={tag}
                                        key={tag.tag_id}
                                        size="sm"
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )

}

export default React.memo(TaskboardTask)