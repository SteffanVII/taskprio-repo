import { cn } from "@/lib/utils";
import { useGetTaskboardSections } from "@/services/private/tasksection/query";
import { useGlobalsStore_selectedTaskboard, useGlobalsStore_taskboardsIsLoading } from "@/stores/globals";
import TaskboardSection from "./TaskboardSection";
import { TTaskSection, TTaskSectionWithTasks } from "@repo/taskprio-types/src/index";
import TaskboardSectionCreator from "./TaskboardSectionCreator";
import TaskboardSectionDrop from "./TaskboardSectionDrop";
import { TaskboardTaskDialog } from "../dialogs/taskboardTaskDialog/TaskboardTaskdialog";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import TaskboardSkeleton from "./TaskboardSkeleton";
import { useTaskboardDragStore_taskboardSectionDrag, useTaskboardDragStore_taskboardTaskDrag } from "@/stores/taskboardDrag";

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
    const taskboardSectionDrag = useTaskboardDragStore_taskboardSectionDrag()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()
    const taskboardsIsLoading = useGlobalsStore_taskboardsIsLoading()

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<ReturnType<typeof requestAnimationFrame>>(null)

    const [ dragDirection, setDragDirection ] = useState<number>(0)

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

    const onAutoScrollerLeftOnMouseEnter = () => {
        setDragDirection(-1)
    }
    
    const onAutoScrollerRightOnMouseEnter = () => {
        setDragDirection(1)
    }
    
    const onAutoScrollerOnMouseLeave = () => {
        setDragDirection(0)
    }

    useEffect(() => {
        const dragFunction = () => {
            if ( scrollAreaRef.current ) {
                if ( dragDirection < 0 ) {
                    scrollAreaRef.current.scrollLeft = scrollAreaRef.current.scrollLeft - 10
                    // scrollAreaRef.current.scrollBy({
                    //     left : -40,
                    //     behavior : "smooth"
                    // })
                } else {
                    scrollAreaRef.current.scrollLeft = scrollAreaRef.current.scrollLeft + 10
                    // scrollAreaRef.current.scrollBy({
                    //     left : 40,
                    //     behavior : "smooth"
                    // })
                }
            }
            animationFrameRef.current = requestAnimationFrame(dragFunction)
        }
        if ( animationFrameRef.current ) {
            cancelAnimationFrame(animationFrameRef.current)
        }
        if ( dragDirection !== 0 ) {
            animationFrameRef.current = requestAnimationFrame(dragFunction)
        }
    }, [dragDirection])

    return (
        <div
            className={cn(
                `relative grow grid h-full min-w-0 min-h-0 max-h-full`
            )}
            style={{
                gridTemplateColumns : "1fr"
            }}
        >
            {
                (!!taskboardTaskDrag.taskboardTask || !!taskboardSectionDrag.taskboardSection) && (
                    <>
                        {
                            scrollAreaRef.current?.scrollLeft !== 0 &&
                            <div
                                onDragEnter={onAutoScrollerLeftOnMouseEnter}
                                onDragLeave={onAutoScrollerOnMouseLeave}
                                className={cn(
                                    `absolute top-0 left-0 w-[2rem] h-full z-[9999]`,
                                    // `bg-red-400 border border-destructive`
                                )}
                            ></div>
                        }
                        {
                            scrollAreaRef.current?.scrollLeft !== (scrollAreaRef.current!.scrollWidth - scrollAreaRef.current!.clientWidth) &&
                            <div
                                onDragEnter={onAutoScrollerRightOnMouseEnter}
                                onDragLeave={onAutoScrollerOnMouseLeave}
                                className={cn(
                                    `absolute top-0 right-0 w-[2rem] h-full z-[9999]`,
                                    // `bg-red-400 border border-destructive`
                                )}
                            ></div>
                        }
                    </>
                )
            }
            <div
                ref={scrollAreaRef}
                className={cn(
                    ` relative`,
                    ` size-full min-h-0 pt-6 overflow-x-auto `,
                    ` flex grow flex-nowrap rounded-tl-md `,
                    ` cursor-grab active:cursor-grabbing select-none `,
                    // ` border border-red-500 `
                )}
                onMouseDown={ e => {
                    
                    const el = e.currentTarget
                    const startX = e.pageX
                    const scrollLeft = el.scrollLeft

                    const onMouseMove = ( e : MouseEvent ) => {
                        const dx = e.pageX - startX
                        el.scrollLeft = scrollLeft - dx
                    }

                    const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove)
                        document.removeEventListener("mouseup", onMouseUp)
                    }

                    document.addEventListener("mousemove", onMouseMove)
                    document.addEventListener("mouseup", onMouseUp)
                    
                } }
            >
                {
                    showSkeleton &&
                    <TaskboardSkeleton/>
                }
                {
                    ( !showSkeleton && task_board_id && taskboardSections && taskboardSections.length > 0 ) &&
                    <>
                        {...taskboardSectionWithRenderInfo}
                        <TaskboardTaskDialog/>
                    </>
                }
                {
                    !showSkeleton &&
                    <TaskboardSectionCreator/>
                }
                {/* <ScrollBar orientation="horizontal" /> */}
            </div>
            {/* <TaskboardSidebar/> */}
        </div>
    )

}

export default Taskboard;