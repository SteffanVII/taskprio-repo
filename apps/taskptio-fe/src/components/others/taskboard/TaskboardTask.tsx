import { cn } from "@/lib/utils"
import { TTask } from "@/services/private/task/types"
import { updateGlobalsStore } from "@/stores/globals"
import { useNavigate, useParams } from "react-router"
import TaskAssigner from "../shared/TaskAssigner"
import { useState } from "react"

export type TTaskboardTaskProps = {
    task : TTask
}

export const TaskboardTask : React.FC<TTaskboardTaskProps> = ( {
    task
} ) => {

    const {
        task_board_slug,
        task_id
    } = useParams()

    const navigate = useNavigate()

    const [ assignees, setAssignees ] = useState<string[]>( task.assignees.map( assignee => assignee.user_id ) )

    const onClickHandler = () => {
        navigate( task_id ? `../t/${task_board_slug}/${task.task_id}` : `${task.task_id}`, { replace : true } )
    }

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateGlobalsStore({
            taskboardTaskDrag : {
                taskboardTask : task
            }
        })
    }

    const onDragEndHandler = () => {
        updateGlobalsStore({
            taskboardTaskDrag : {
                taskboardTask : null
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
                ` w-[20rem] min-w-[20rem] h-fit `,
                ` bg-background border border-border rounded-md `
            )}
            draggable={true}
            onDragStart={ onDragStartHandler }
            onDragEnd={ onDragEndHandler }
            onMouseDown={ onMouseDownHandler }
            onClick={ onClickHandler }
        >
            <p
                className={cn(
                    ` p-3 `
                )}
            >{task.task_title}</p>
            <div
                className={` flex justify-end px-3 pb-3 `}
            >
                <TaskAssigner
                    task_id={task.task_id}
                    assignees={assignees}
                    onAssigneesChange={setAssignees}
                />
            </div>
        </div>
    )

}

export default TaskboardTask