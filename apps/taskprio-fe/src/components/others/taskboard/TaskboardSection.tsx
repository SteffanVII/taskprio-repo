import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TTaskSectionWithTasks } from "@repo/taskprio-types/src/index";
import { Ellipsis, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import TaskboardTaskInitialCreator from "./TaskboardTaskInitialCreator";
import { useCreateTask } from "@/services/private/task/mutation";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import TaskboardTask from "./TaskboardTask";
import TaskboardTaskDrop from "./TaskboardTaskDrop";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import TaskboardSectionMenu from "./TaskboardSectionMenu";
import { Input } from "@/components/ui/input";
import { useUpdateTaskboardSection } from "@/services/private/tasksection/mutation";
import { ScrollArea } from "@/components/ui/scroll-area";


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

    const [ rename, setRename ] = useState( false )
    const [ renameValue, setRenameValue ] = useState( "" )

    const {
        mutateAsync : createTaskMutation,
        isPending : isCreatingTask
    } = useCreateTask()

    const {
        mutateAsync : updateTaskboardSectionMutation
    } = useUpdateTaskboardSection()

    const sortedTaskSectionTasks = useMemo(() => {
        return [...taskSection.tasks].sort( ( a, b ) => b.display_order - a.display_order )
    }, [taskSection.tasks])

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

    const openRenameModal = () => {
        setRenameValue( taskSection.task_section_name )
        setRename( true )
    }

    const closeRenameModal = () => {
        setRename( false )
        setRenameValue( "" )
    }

    const onRenameSubmit = () => {

        if ( renameValue.trim() === "" ) {
            return
        }

        updateTaskboardSectionMutation({
            task_section_id : taskSection.task_section_id,
            body : {
                task_section_name : renameValue
            }
        })

        closeRenameModal()
    }

    return (
        <div
            className={cn(
                ` w-[20rem] min-w-[20rem] h-full min-h-0 `,
                ` grid `
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <div
                className={cn(
                    ` w-full p-1 pl-4 `,
                    ` flex justify-between items-center gap-2 `,
                    ` bg-background rounded-md z-10 `,
                )}
                style={ taskSection.task_section_color ? {
                    color : getHexLuminance( taskSection.task_section_color ) > 0.4 ? "black" : "white",
                    backgroundColor : taskSection.task_section_color,
                    boxShadow : `${taskSection.task_section_color}40 0px 0.5rem 10px 0px`
                } : undefined }
                draggable={true}
                onDragStart={ onDragStartHandler }
                onMouseDown={ onMouseDownHandler }
            >
                {
                    rename ?
                    <Input
                        value={renameValue}
                        onChange={ e => setRenameValue( e.target.value ) }
                        onBlur={() => {
                            closeRenameModal()
                        }}
                        onKeyDown={ e => {
                            if (e.key === 'Enter') {
                                onRenameSubmit()
                            }
                            if (e.key === 'Escape') {
                                e.currentTarget.blur()
                            }
                        }}
                        className=" !border-background "
                        autoFocus
                    />
                    :
                    <p>{taskSection.task_section_name}</p>
                }
                <div
                    className=" flex "
                >
                    <TaskboardSectionMenu
                        taskSection={taskSection}
                        openRenameModal={openRenameModal}
                    />
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

            <ScrollArea
                className="relative flex flex-col w-full h-full min-h-full "
            >
                <div
                    className={cn(
                        `relative grow w-full h-full min-h-full `,
                        `flex flex-col`,
                        // `border border-green-400`
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
                        sortedTaskSectionTasks.length === 0 &&
                        <TaskboardTaskDrop
                            task_section_id={taskSection.task_section_id}
                            display_order={100}
                            fullSize={true}
                        />
                    }
                    {
                        sortedTaskSectionTasks.sort( ( a, b ) => b.display_order - a.display_order ).map( ( task, taskIndex ) => {

                            // const singleTask = sortedTaskSectionTasks.length === 1
                            const firstTask = taskIndex === 0
                            const lastTask = taskIndex === sortedTaskSectionTasks.length - 1

                            const adjacentBottom = lastTask ? null : sortedTaskSectionTasks[ taskIndex + 1 ]

                            const displayOrderTop = task.display_order + 100
                            const displayOrderBottom = lastTask ? task.display_order - 100 : (( task.display_order - adjacentBottom!.display_order ) / 2) + adjacentBottom!.display_order

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
            </ScrollArea>
        </div>
    )

}

export default TaskboardSection;