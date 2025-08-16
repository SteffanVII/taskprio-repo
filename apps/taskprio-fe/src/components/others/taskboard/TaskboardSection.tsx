import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TTaskSectionWithTasks } from "@repo/taskprio-types/src/index";
import { Ellipsis, Plus } from "lucide-react";
import React, { useState } from "react";
import TaskboardTaskInitialCreator from "./TaskboardTaskInitialCreator";
import { useCreateTask } from "@/services/private/task/mutation";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import TaskboardTask from "./TaskboardTask";
import TaskboardTaskDrop from "./TaskboardTaskDrop";


export type TTaskboardSectionProps = {
    taskSection : TTaskSectionWithTasks
}

export const TaskboardSection : React.FC<TTaskboardSectionProps> = ( {
    taskSection
} ) => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const [ createTask, setCreateTask ] = useState( false )

    const {
        mutateAsync : createTaskMutation,
        isPending : isCreatingTask
    } = useCreateTask()

    const onTaskSubmit = ( taskTitle : string ) => {
        if ( taskTitle.trim() === "" ) return
        if ( !selectedTaskboard ) return
        createTaskMutation( {
            body : {
                task_board_id : selectedTaskboard.task_board_id,
                task_section_id : taskSection.task_section_id,
                task_title : taskTitle
            }
        } )
    }

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateGlobalsStore({
            taskboardSectionDrag : {
                taskboardSection : taskSection
            }
        })
    }

    // IMPORTANT : Prevent the taskboard from being drag scrolled
    const onMouseDownHandler = ( e : React.MouseEvent<HTMLDivElement> ) => {
        e.stopPropagation()
    }

    return (
        <div
            className={cn(
                ` w-[20rem] min-w-[20rem] h-full `,
                ` flex flex-col shrink-0 `
            )}
        >
            <div
                className={cn(
                    ` w-full p-1 pl-4 `,
                    ` flex justify-between items-center `,
                    ` bg-background rounded-md shadow `
                )}
                draggable={true}
                onDragStart={ onDragStartHandler }
                onMouseDown={ onMouseDownHandler }
            >
                <p>{taskSection.task_section_name}</p>
                <div
                    className=" flex "
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className=" size-8 "
                    >
                        <Ellipsis className=" size-4 " />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className=" size-8 "
                        onClick={() => {
                            setCreateTask( true )
                        }}
                    ><Plus className=" size-4 " /></Button>
                </div>
            </div>

            <div
                className={cn(
                    ` w-full h-full `,
                    ` flex flex-col `
                )}
            >
                {
                    (createTask || isCreatingTask) &&
                    <TaskboardTaskInitialCreator
                        outOfFocusCallback={( taskTitle ) => {
                            setCreateTask( false )
                            onTaskSubmit( taskTitle )
                        }}
                    />
                }
                {
                    taskSection.tasks.length === 0 &&
                    <TaskboardTaskDrop
                        task_section_id={taskSection.task_section_id}
                        display_order={100}
                        fullSize={true}
                    />
                }
                {
                    taskSection.tasks.sort( ( a, b ) => b.display_order - a.display_order ).map( ( task, taskIndex ) => {

                        const singleTask = taskSection.tasks.length === 1
                        const firstTask = taskIndex === 0
                        const lastTask = taskIndex === taskSection.tasks.length - 1

                        const adjacentTop = firstTask && !singleTask ? null : taskSection.tasks[ taskIndex - 1 ]
                        const adjacentBottom = lastTask && !singleTask ? null : taskSection.tasks[ taskIndex + 1 ]
                        
                        const displayOrderTop = firstTask ? task.display_order + 100 : ( adjacentTop!.display_order + task.display_order ) / 2
                        const displayOrderBottom = lastTask ? task.display_order - 100 : ( adjacentBottom!.display_order + task.display_order ) / 2

                        return (
                            <React.Fragment key={task.task_id}>
                                {
                                    firstTask &&
                                    <TaskboardTaskDrop
                                        task_section_id={taskSection.task_section_id}
                                        display_order={displayOrderTop}
                                        bottomTaskId={task?.task_id}
                                    />
                                }
                                <TaskboardTask
                                    key={task.task_id}
                                    task={task}
                                />
                                <TaskboardTaskDrop
                                    task_section_id={taskSection.task_section_id}
                                    display_order={displayOrderBottom}
                                    topTaskId={task.task_id}
                                    bottomTaskId={adjacentBottom?.task_id}
                                    fullSize={lastTask}
                                />
                            </React.Fragment>
                        )
                    } )
                }
            </div>
        </div>
    )

}

export default TaskboardSection;