import { cn } from "@/lib/utils"
import { useTaskboardDragStore_taskboardTaskDrag } from "@/stores/taskboardDrag"
import { useDroppable } from "@dnd-kit/core"

import React from "react"
import TaskboardTask from "./TaskboardTask"

export type TTaskboardTaskDrop = {
    task_section_id : string,
    display_order : number,
    topTaskId? : string,
    bottomTaskId? : string,
    fullSize? : boolean
}

const TaskboardTaskDrop : React.FC<TTaskboardTaskDrop> = ( props ) => {

    const { task_section_id, display_order, topTaskId, bottomTaskId, fullSize } = props

    const { taskboardTask } = useTaskboardDragStore_taskboardTaskDrag()

    const {
        isOver,
        setNodeRef
    } = useDroppable({
        id : `${display_order}_${task_section_id}${topTaskId ? `_${topTaskId}` : ""}${bottomTaskId ? `_${bottomTaskId}` : ""}`,
        data : props,
        disabled : taskboardTask?.task_id === topTaskId || taskboardTask?.task_id === bottomTaskId
    })

    return (
        <div
            className={cn(
                ` relative `,
                ` flex items-center `,
                ` h-[1rem] w-full min-h-0 pointer-events-none `,
                isOver && ` h-fit !py-4 `,
                fullSize && `grow h-[40rem] `,
            )}
        >
            <div
                ref={setNodeRef}
                className={cn(
                    ` h-full w-full `,
                    ` pointer-events-none `,
                    taskboardTask && `pointer-events-auto `
                )}
            >
                {
                    (isOver && taskboardTask) && (
                        <TaskboardTask
                            task={taskboardTask}
                            preview
                            dimensionFiller
                        />
                    )
                }
            </div>
        </div>
    )

}

export default TaskboardTaskDrop;