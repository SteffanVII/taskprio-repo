import { cn } from "@/lib/utils";
import { useGetTaskboardSections } from "@/services/private/tasksection/query";
import { useGlobalsStore_selectedTaskboard, useGlobalsStore_taskboardsIsLoading } from "@/stores/globals";
import TaskboardSection from "./TaskboardSection";
import { TTaskForCardView, TTaskSection, TTaskSectionWithTasks } from "@repo/taskprio-types/src/index";
import TaskboardSectionCreator from "./TaskboardSectionCreator";
import TaskboardSectionDrop, { TTaskboardSectionDropProps } from "./TaskboardSectionDrop";
import { TaskboardTaskDialog } from "../dialogs/taskboardTaskDialog/TaskboardTaskdialog";
import React, { useMemo, useRef } from "react";
import { useParams } from "react-router";
import { updateTaskboardDragStore, useTaskboardDragStore_taskboardTaskDrag } from "@/stores/taskboardDrag";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { useArrangeTask } from "@/services/private/task/mutation";
import { TTaskboardTaskDrop } from "./TaskboardTaskDrop";
import TaskboardSkeleton from "./TaskboardSkeleton";
import TaskboardTask from "./TaskboardTask";
import { useUpdateTaskboardSection } from "@/services/private/tasksection/mutation";

export enum ETaskboardDragDataType {
    TASK = "task",
    SECTION = "section"
}

type TTaskboardSectionRenderInfo = {
    firstSection : boolean,
    lastSection : boolean,
    adjacentTop : TTaskSection | null,
    adjacentBottom : TTaskSection | null,
    displayOrderTop : number,
    displayOrderBottom : number,
    taskboardSection : TTaskSection
}

export const Taskboard = () => {

    const {
        task_board_id
    } = useParams()

    const taskboardTaskDrag = useTaskboardDragStore_taskboardTaskDrag()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()
    const taskboardsIsLoading = useGlobalsStore_taskboardsIsLoading()

    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint : {
                distance : 8
            }
        })
    )

    const {
        data : taskboardSections,
        isLoading : taskboardSectionsIsLoading,
    } = useGetTaskboardSections({
        payload : {
            pathParameter : {
                task_board_id : task_board_id
            },
            pathQuery : {
                include_tasks : true
            }
        },
        options : {
            enabled : !!selectedTaskboard && !!task_board_id
        }
    })

    const {
        mutateAsync : arrangeTaskMutation
    } = useArrangeTask()

    const {
        mutateAsync : updateTaskboardSectionMutation,
    } = useUpdateTaskboardSection()

    const taskboardSectionWithRenderInfo = useMemo<React.ReactNode[]>(() => {

        if ( !!taskboardSections ) {

            const singleSection = taskboardSections.length === 1
            
            return taskboardSections?.map( (taskboardSection, taskboardSectionIndex) => {
                const firstSection = taskboardSectionIndex === 0
                const lastSection = taskboardSectionIndex === taskboardSections.length - 1
    
                const adjacentTop = firstSection && !singleSection ? null : taskboardSections[taskboardSectionIndex - 1]
                const adjacentBottom = lastSection && !singleSection ? null : taskboardSections[taskboardSectionIndex + 1]
    
                const displayOrderTop = firstSection ? taskboardSection.display_order - 100 : ( adjacentTop!.display_order + taskboardSection.display_order ) / 2
                const displayOrderBottom = lastSection ? taskboardSection.display_order + 100 : ( adjacentBottom!.display_order + taskboardSection.display_order ) / 2

                const renderInfo : TTaskboardSectionRenderInfo = {
                    firstSection,
                    lastSection,
                    adjacentTop,
                    adjacentBottom,
                    displayOrderTop,
                    displayOrderBottom,
                    taskboardSection
                }

                return (
                    <React.Fragment key={renderInfo.taskboardSection.task_section_id}>
                        {
                            renderInfo.firstSection &&
                            <TaskboardSectionDrop
                                displayOrder={ renderInfo.displayOrderTop }
                                bottomTaskSectionId={ renderInfo.taskboardSection.task_section_id }
                            />
                        }
                        <TaskboardSection
                            key={renderInfo.taskboardSection.task_section_id}
                            taskSection={{...renderInfo.taskboardSection as TTaskSectionWithTasks}}
                        />
                        <TaskboardSectionDrop
                            displayOrder={ renderInfo.displayOrderBottom }
                            topTaskSectionId={ renderInfo.taskboardSection.task_section_id }
                            bottomTaskSectionId={ renderInfo.adjacentBottom?.task_section_id }
                        />
                    </React.Fragment>
                );
            } )
        }

        return []
        

    }, [
        taskboardSections
    ])

    const showSkeleton = useMemo(() => {
        return (taskboardsIsLoading || taskboardSectionsIsLoading || !task_board_id)
    }, [
        taskboardsIsLoading,
        taskboardSectionsIsLoading,
        task_board_id
    ])

    const onScrollAreaMouseDown = ( e : React.MouseEvent<HTMLDivElement, MouseEvent> ) => {

        e.preventDefault()

        if ( !!taskboardTaskDrag.taskboardTask ) return

        const el = e.currentTarget
        const startX = e.pageX
        const startScrollLeft = el.scrollLeft

        let ticking = false
        const onMouseMove = ( moveEvent : MouseEvent ) => {
            if ( !ticking ) {
                // Determine current x immediately
                const currentX = moveEvent.pageX
                
                requestAnimationFrame(() => {
                    const dx = currentX - startX
                    el.scrollLeft = startScrollLeft - dx
                    ticking = false
                })
                
                ticking = true
            }
        }

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)

    }

    const onDndContextDragStart = ( e : DragStartEvent ) => {
        if ( e.active.data.current && e.active.data.current.type === ETaskboardDragDataType.TASK ) {
            updateTaskboardDragStore({
                taskboardTaskDrag : {
                    taskboardTask : e.active.data.current.data as TTaskForCardView
                }
            })
        }
        if ( e.active.data.current && e.active.data.current.type === ETaskboardDragDataType.SECTION ) {
            updateTaskboardDragStore({
                taskboardSectionDrag : {
                    taskboardSection : e.active.data.current.data as TTaskSection
                }
            })
        }
    }

    const onDndContextDragEnd = ( e : DragEndEvent ) => {

        updateTaskboardDragStore({
            taskboardTaskDrag : {
                taskboardTask : null
            },
            taskboardSectionDrag : {
                taskboardSection : null
            }
        })

        if (
            e.active.data.current &&
            e.over?.data.current
        ) {
            if ( !!e.active.data.current.data ) {
                if ( e.active.data.current.type === ETaskboardDragDataType.TASK ) {
                    const task = e.active.data.current.data as TTaskForCardView
                    const dropData = e.over?.data.current as TTaskboardTaskDrop
                    arrangeTaskMutation({
                        task_id : task.task_id,
                        body : {
                            task_section_id : dropData.task_section_id,
                            display_order : dropData.display_order
                        }
                    })
                }
                if ( e.active.data.current.type === ETaskboardDragDataType.SECTION ) {
                    const section = e.active.data.current.data as TTaskSection
                    const dropData = e.over?.data.current as TTaskboardSectionDropProps
                    updateTaskboardSectionMutation({
                        task_section_id : section.task_section_id,
                        body : {
                            display_order : dropData.displayOrder
                        }
                    })
                }
            }
        }

    }

    return (

        <div
            className={cn(
                `relative grow grid h-full min-w-0 min-h-0 max-h-full bg-background`
            )}
            style={{
                gridTemplateColumns : "1fr"
            }}
        >
            <div
                ref={scrollAreaRef}
                className={cn(
                    ` relative`,
                    ` size-full min-h-0 pt-6 overflow-x-auto `,
                    ` flex grow flex-nowrap rounded-tl-md `,
                    ` cursor-grab active:cursor-grabbing select-none `,
                )}
                onMouseDown={onScrollAreaMouseDown}
            >
                {
                    showSkeleton &&
                    <TaskboardSkeleton/>
                }
                {
                    ( !showSkeleton && task_board_id && taskboardSections && taskboardSections.length > 0 ) &&
                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={onDndContextDragStart}
                        onDragEnd={onDndContextDragEnd}
                    >
                        <DragOverlay
                            dropAnimation={null}
                        >
                            {
                                taskboardTaskDrag.taskboardTask && (
                                    <TaskboardTask
                                        task={taskboardTaskDrag.taskboardTask}
                                        preview
                                    />
                                )
                            }
                        </DragOverlay>
                        {...taskboardSectionWithRenderInfo}
                        <TaskboardTaskDialog/>
                    </DndContext>
                }
                {
                    !showSkeleton &&
                    <TaskboardSectionCreator/>
                }
            </div>
        </div>
    )

}

export default Taskboard;