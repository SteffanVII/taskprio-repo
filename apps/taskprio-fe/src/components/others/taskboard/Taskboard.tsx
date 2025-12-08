import { cn } from "@/lib/utils";
import { useGetTaskboardSections } from "@/services/private/tasksection/query";
import { useGlobalsStore_selectedTaskboard, useGlobalsStore_taskboardsIsLoading } from "@/stores/globals";
import TaskboardSection from "./TaskboardSection";
import { TTaskSection, TTaskSectionWithTasks } from "@repo/taskprio-types/src/index";
import TaskboardSectionCreator from "./TaskboardSectionCreator";
import TaskboardSectionDrop from "./TaskboardSectionDrop";
import { TaskboardTaskDialog } from "../dialogs/taskboardTaskDialog/TaskboardTaskdialog";
import React, { useMemo } from "react";
import { useParams } from "react-router";
import TaskboardSkeleton from "./TaskboardSkeleton";

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

    const selectedTaskboard = useGlobalsStore_selectedTaskboard()
    const taskboardsIsLoading = useGlobalsStore_taskboardsIsLoading()

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

    return (
        <div
            className={cn(
                `relative grow grid h-full min-w-0 min-h-0 max-h-full bg-accent/30 `
            )}
            style={{
                gridTemplateColumns : "1fr"
            }}
        >
            <div
                className={cn(
                    ` relative`,
                    ` size-full min-h-0 bg-background pt-6 overflow-x-auto overflow-y-hidden `,
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
            </div>
            {/* <TaskboardSidebar/> */}
        </div>
    )

}

export default Taskboard;