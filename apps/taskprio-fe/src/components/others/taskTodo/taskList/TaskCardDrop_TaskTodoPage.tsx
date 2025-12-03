import { cn } from "@/lib/utils"
import { useMoveTaskToTodo, useUpdateTaskTodoState } from "@/services/private/todo/mutation"
import { useTaskboardDragStore_taskboardTaskTodoDrag } from "@/stores/taskboardDrag"

import { useState } from "react"

type TTaskCardDropProps = {
    displayOrder : number,
    fullSize? : boolean,
    topTaskId? : string,
    bottomTaskId? : string
}

const TaskCardDrop : React.FC<TTaskCardDropProps> = ({
    displayOrder,
    fullSize,
    topTaskId,
    bottomTaskId
}) => {

    const { taskboardTaskTodo } = useTaskboardDragStore_taskboardTaskTodoDrag()

    const [ draggedOver, setDraggedOver ] = useState(false)

    const {
        mutateAsync : moveTaskToTodoTrigger
    } = useMoveTaskToTodo()

    const {
        mutateAsync : updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState()

    const onDragOverHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        e.preventDefault();
        if ( taskboardTaskTodo && taskboardTaskTodo.task_id !== topTaskId && taskboardTaskTodo.task_id !== bottomTaskId ) {
            e.dataTransfer.setData( "displayOrder", displayOrder.toString() )
            setDraggedOver(true)
        }
    }

    const onDragLeaveHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        setDraggedOver(false)
    }

    const onDropHandler = () => {

        if ( taskboardTaskTodo ) {
            if ( !topTaskId && !bottomTaskId ) {
                moveTaskToTodoTrigger({
                    pathParameters : {
                        task_id : taskboardTaskTodo.task_id
                    },
                    body : {
                        display_order : displayOrder
                    },
                    optimisticHelpers : {
                        task : taskboardTaskTodo
                    }
                })
            } else {
                if ( "active" in taskboardTaskTodo ) {
                    if ( taskboardTaskTodo.active ) {
                        updateTaskTodoStateTrigger({
                            pathParameters : {
                                task_id : taskboardTaskTodo.task_id
                            },
                            body : {
                                display_order : displayOrder,
                                active : true
                            }
                        })
                    } else {
                        moveTaskToTodoTrigger({
                            pathParameters : {
                                task_id : taskboardTaskTodo.task_id
                            },
                            body : {
                                display_order : displayOrder
                            },
                            optimisticHelpers : {
                                task : taskboardTaskTodo
                            }
                        })
                    }
                }
            }
        }

        setDraggedOver( false )

    }

    return (
        <div
            className={cn(
                `relative`,
                `flex items-center`,
                `h-[1rem] w-full`,
                draggedOver && ` h-[6rem] `,
                fullSize && ` h-full `
            )}
        >
            <div
                className={cn(
                    `absolute top-1/2 -translate-y-1/2`,
                    ` h-[calc(100%+1rem)] w-full `,
                    ` pointer-events-none `,
                    taskboardTaskTodo && ` pointer-events-auto `
                )}
                onDragOver={onDragOverHandler}
                onDragLeave={onDragLeaveHandler}
                onDrop={onDropHandler}
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

export default TaskCardDrop;