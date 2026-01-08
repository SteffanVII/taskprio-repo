import { cn } from "@/lib/utils"
import { useTaskboardDragStore_taskboardSectionDrag } from "@/stores/taskboardDrag"
import { useDroppable } from "@dnd-kit/core"
import React from "react"

export type TTaskboardSectionDropProps = {
    displayOrder : number,
    topTaskSectionId? : string,
    bottomTaskSectionId? : string
}

export const TaskboardSectionDrop : React.FC<TTaskboardSectionDropProps> = ( props ) => {

    const { displayOrder, topTaskSectionId, bottomTaskSectionId } = props

    const { taskboardSection } = useTaskboardDragStore_taskboardSectionDrag()

    const {
        isOver,
        setNodeRef
    } = useDroppable({
        id : `${displayOrder}_${topTaskSectionId}_${bottomTaskSectionId}`,
        data : props,
        disabled : !taskboardSection || taskboardSection.task_section_id === topTaskSectionId || taskboardSection.task_section_id === bottomTaskSectionId
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                ` flex-shrink-0 w-[1.6rem] h-full min-h-0 max-h-full transition-all duration-200 `,
                isOver && ` w-[1.9rem] `
            )}
        >
            <div
                className={cn(
                    ` w-[0rem] h-full mx-auto bg-blue-300 rounded-full transition-all duration-200 pointer-events-none `,
                    isOver && ` w-[0.3rem] `
                )}
            ></div>
        </div>
    )

}

export default React.memo( TaskboardSectionDrop)