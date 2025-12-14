import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { updateTaskboardDragStore } from "@/stores/taskboardDrag"
import { TUserAvailableTaskTodo } from "@repo/taskprio-types/src"
import TagBadge from "../../shared/tag/TagBadge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMoveTaskToTodo } from "@/services/private/todo/mutation"
import { useTaskTodoPageStore_sessionActive, useTaskTodoPageStore_topTaskTodo } from "@/stores/taskTodoPage"

type TTaskCardProps = {
    data : TUserAvailableTaskTodo
}

const TaskCard : React.FC<TTaskCardProps> = ({
    data
}) => {

    const sessionActive = useTaskTodoPageStore_sessionActive()
    const topTaskTodo = useTaskTodoPageStore_topTaskTodo()

    const {
        mutateAsync : moveTaskToTodoTrigger
    } = useMoveTaskToTodo()

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateTaskboardDragStore({
            taskboardTaskTodoDrag : {
                taskboardTaskTodo : data
            }
        })
    }

    const onDragEndHandler = () => {
        updateTaskboardDragStore({
            taskboardTaskTodoDrag : {
                taskboardTaskTodo : null
            }
        })
    }

    const onMouseDownHandler = ( e : React.MouseEvent<HTMLDivElement> ) => {
        e.stopPropagation()
    }

    const handleMoveTaskToTodoTrigger = async () => {
        moveTaskToTodoTrigger({
            pathParameters : {
                task_id : data.task_id
            },
            body : {
                display_order : topTaskTodo ? topTaskTodo.display_order + 100 : 0
            },
            optimisticHelpers : {
                task : data
            }
        })
    }

    return (
        <div
            className={cn(
                `group`,
                ` w-full h-fit `,
                ` bg-card border border-border shadow `,
                `rounded-md`
            )}
            draggable={true}
            onDragStart={onDragStartHandler}
            onDragEnd={onDragEndHandler}
            onMouseDown={onMouseDownHandler}
        >
            <div className="flex items-start justify-between" >
                <p
                    className={cn(
                        `w-fit px-2 py-1 ml-2 mt-2 rounded bg-primary text-xs text-primary-foreground font-semibold`,
                        data.project_color !== "#ffffff" && getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                    )}
                    style={{
                        backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                    }}
                >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
                <div
                    className={cn(
                        `flex gap-2 pt-2 pr-2`,
                        `opacity-0 pointer-events-none`,
                        !sessionActive && `group-hover:opacity-100 group-hover:pointer-events-auto`
                    )}
                >
                    <Button
                        size={"icon-sm"}
                        variant={"outline"}
                        onClick={handleMoveTaskToTodoTrigger}
                    ><Plus/></Button>
                </div>
            </div>
            <p
                className={cn(
                    `text-sm p-3 `
                )}
            >{data.task_title}</p>
            {
                data.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 rounded-bl-[0.3rem] `,
                            ` m-2 `
                        )}
                    >
                        {
                            data.tags.map( tag => (
                                <TagBadge
                                    tag={tag}
                                    key={tag.tag_id}
                                    size="sm"
                                />
                            ) )
                        }
                    </div>
                )
            }
        </div>
    )

}

export default TaskCard;