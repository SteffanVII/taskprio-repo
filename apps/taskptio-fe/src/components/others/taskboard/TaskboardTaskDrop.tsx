import { cn } from "@/lib/utils"
import { useArrangeTask } from "@/services/private/task/mutation"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import React, { useState } from "react"

export type TTaskboardTaskDrop = {
    task_section_id : string,
    display_order : number,
    topTaskId? : string,
    bottomTaskId? : string,
    fullSize? : boolean
}

const TaskboardTaskDrop : React.FC<TTaskboardTaskDrop> = ({ task_section_id, display_order, topTaskId, bottomTaskId, fullSize }) => {

    const {
        taskboardTaskDrag : {
            taskboardTask
        }
    } = useGlobalsStore()

    const [ draggedOver, setDraggedOver ] = useState<boolean>( false)

    const {
        mutateAsync : arrangeTaskMutation
    } = useArrangeTask()

    const onDragOverHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        e.preventDefault();
        if ( taskboardTask && taskboardTask.task_id !== topTaskId && taskboardTask.task_id !== bottomTaskId ) {
            e.dataTransfer.setData( "displayOrder", display_order.toString() )
            setDraggedOver( true )
        }
    }

    const onDragLeaveHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        setDraggedOver( false )
    }

    const onDropHandler = () => {

        if ( taskboardTask ) {
            arrangeTaskMutation({
                task_id : taskboardTask.task_id,
                body : {
                    task_section_id : task_section_id,
                    display_order : display_order
                }
            })
        }

        setDraggedOver( false )
    }

    return (
        <div
            className={cn(
                ` relative `,
                ` flex items-center `,
                ` h-[1rem] w-full pointer-events-none `,
                draggedOver && ` h-[6rem] `,
                fullSize && ` h-full `,
            )}
        >
            <div
                className={cn(
                    // ` border border-red-300 `,
                    ` absolute top-1/2 -translate-y-1/2 `,
                    ` h-[calc(100%+1rem)] w-full `,
                    ` pointer-events-none `,
                    taskboardTask && ` pointer-events-auto `
                )}
                onDragOver={ onDragOverHandler }
                onDragLeave={ onDragLeaveHandler }
                onDrop={ onDropHandler }
            ></div>
            <div
                className={cn(
                    ` w-full h-[0rem] my-auto rounded-md `,
                    ` border-blue-300 bg-blue-300/10 `,
                    ` pointer-events-none `,
                    fullSize && ` mt-auto `,
                    draggedOver && !fullSize && ` border h-[3rem]  `,
                    draggedOver && fullSize && ` border h-[calc(100%-2rem)] `
                )}
            ></div>
        </div>
    )

}

export default TaskboardTaskDrop;