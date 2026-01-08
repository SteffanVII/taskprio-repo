import { cn } from "@/lib/utils"
import { useTaskboardDragStore_taskboardTaskTodoDrag } from "@/stores/taskboardDrag"
import { ETaskTodoPageUIMode, useTaskTodoPageStore_uIMode } from "@/stores/taskTodoPage"
import { useDroppable } from "@dnd-kit/core"

import TaskCard from "./TaskCard_TaskTodoPage"
import { TUserTaskTodoState } from "@repo/taskprio-types/src"

type TTaskCardDropProps = {
    displayOrder : number,
    fullSize? : boolean,
    topTaskId? : string,
    bottomTaskId? : string,
    noTodoMessage? : boolean;
}

const TaskCardDrop : React.FC<TTaskCardDropProps> = ( props ) => {

    const {
        displayOrder,
        fullSize,
        topTaskId,
        bottomTaskId,
        noTodoMessage
    } = props

    const uIMode = useTaskTodoPageStore_uIMode()

    const { taskboardTaskTodo } = useTaskboardDragStore_taskboardTaskTodoDrag()

    // const [ draggedOver, setDraggedOver ] = useState(false)

    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id : `${displayOrder}_${topTaskId}_${bottomTaskId}`,
        data : props,
        disabled : taskboardTaskTodo?.task_id === topTaskId || taskboardTaskTodo?.task_id === bottomTaskId
    })

    // const {
    //     mutateAsync : moveTaskToTodoTrigger
    // } = useMoveTaskToTodo()

    // const {
    //     mutateAsync : updateTaskTodoStateTrigger
    // } = useUpdateTaskTodoState()

    // const onDragOverHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
    //     e.stopPropagation()
    //     e.preventDefault();
    //     if ( taskboardTaskTodo && taskboardTaskTodo.task_id !== topTaskId && taskboardTaskTodo.task_id !== bottomTaskId ) {
    //         e.dataTransfer.setData( "displayOrder", displayOrder.toString() )
    //         setDraggedOver(true)
    //     }
    // }

    // const onDragLeaveHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
    //     e.stopPropagation()
    //     setDraggedOver(false)
    // }

    // const onDropHandler = () => {

    //     console.log(displayOrder);

    //     if ( taskboardTaskTodo ) {
    //         if ( !topTaskId && !bottomTaskId ) {
    //             moveTaskToTodoTrigger({
    //                 pathParameters : {
    //                     task_id : taskboardTaskTodo.task_id
    //                 },
    //                 body : {
    //                     display_order : displayOrder
    //                 },
    //                 optimisticHelpers : {
    //                     task : taskboardTaskTodo
    //                 }
    //             })
    //         } else {
    //             if ( "active" in taskboardTaskTodo ) {
    //                 if ( taskboardTaskTodo.active ) {
    //                     updateTaskTodoStateTrigger({
    //                         pathParameters : {
    //                             task_id : taskboardTaskTodo.task_id
    //                         },
    //                         body : {
    //                             display_order : displayOrder,
    //                             active : true
    //                         }
    //                     })
    //                 } else {
    //                     moveTaskToTodoTrigger({
    //                         pathParameters : {
    //                             task_id : taskboardTaskTodo.task_id
    //                         },
    //                         body : {
    //                             display_order : displayOrder
    //                         },
    //                         optimisticHelpers : {
    //                             task : taskboardTaskTodo
    //                         }
    //                     })
    //                 }
    //             }
    //         }
    //     }

    //     setDraggedOver( false )

    // }

    return (
        <div
            ref={setNodeRef}
            className={cn(
                `relative`,
                `flex items-center shrink-0`,
                `h-[1rem] w-full`,
                isOver && ` h-fit py-4`,
                fullSize && `grow h-[80rem] `
            )}
        >
            {
                noTodoMessage &&
                <p className="absolute top-[4rem] w-full text-center font-semibold" >
                    {
                        uIMode === ETaskTodoPageUIMode.OVERLAY ? "Add task to start" : "Drag and drop a task to start"
                    }
                </p>
            }
            <div
                className={cn(
                    ` h-full w-full `,
                    ` pointer-events-none `,
                    taskboardTaskTodo && ` pointer-events-auto `
                )}
            >
                {
                    (isOver && taskboardTaskTodo) && (
                        <TaskCard
                            data={ {
                                ...taskboardTaskTodo,
                                display_order : 0,
                                active : false,
                                completed : false,
                                current_work_time : "0",
                                work_time_goal : "0",
                                timers : []
                            } as TUserTaskTodoState }
                            dimensionFiller
                            preview
                        />
                    )
                }
            </div>
        </div>
    )

}

export default TaskCardDrop;