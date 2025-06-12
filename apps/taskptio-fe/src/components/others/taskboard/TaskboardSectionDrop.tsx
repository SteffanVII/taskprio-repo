import { cn } from "@/lib/utils"
import { useUpdateTaskboardSection } from "@/services/private/tasksection/mutation"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import React, { useState } from "react"

export type TTaskboardSectionDropProps = {
    displayOrder : number,
    topTaskSectionId? : string,
    bottomTaskSectionId? : string
}

export const TaskboardSectionDrop : React.FC<TTaskboardSectionDropProps> = ({ displayOrder, topTaskSectionId, bottomTaskSectionId }) => {

    const {
        taskboardSectionDrag : {
            taskboardSection
        }
    } = useGlobalsStore()

    const {
        mutateAsync : updateTaskboardSectionMutation,
    } = useUpdateTaskboardSection()

    const [ draggedOver, setDraggedOver ] = useState<boolean>( false )

    const onDragOverHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        e.preventDefault()
        if ( taskboardSection && taskboardSection.task_section_id !== topTaskSectionId && taskboardSection.task_section_id !== bottomTaskSectionId ) {
            e.dataTransfer.setData( "displayOrder", displayOrder.toString() )
            setDraggedOver( true )
        }
    }

    const onDragLeaveHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        setDraggedOver( false )
    }

    const onDragDropHandler = () => {

        if ( taskboardSection ) {
            updateTaskboardSectionMutation({
                task_section_id : taskboardSection.task_section_id,
                body : {
                    display_order : displayOrder
                }
            })
        }

        setDraggedOver( false )
        updateGlobalsStore({
            taskboardSectionDrag : {
                taskboardSection : null
            }
        })
    }

    return (
        <div
            className={cn(
                ` flex-shrink-0 w-[1.6rem] h-full transition-all duration-200 `,
                draggedOver && ` w-[1.9rem] `
            )}
            onDragOver={ onDragOverHandler }
            onDragLeave={ onDragLeaveHandler }
            onDrop={ onDragDropHandler }
        >
            <div
                className={cn(
                    ` w-[0rem] h-full mx-auto bg-blue-300 rounded-full transition-all duration-200 pointer-events-none `,
                    draggedOver && ` w-[0.3rem] `
                )}
            ></div>
        </div>
    )

}

export default React.memo( TaskboardSectionDrop)