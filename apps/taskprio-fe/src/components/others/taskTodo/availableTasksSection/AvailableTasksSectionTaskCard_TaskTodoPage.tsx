import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { updateTaskboardDragStore } from "@/stores/taskboardDrag"
import { TUserAvailableTaskTodo } from "@repo/taskprio-types/src"
import TagBadge from "../../shared/tag/TagBadge"

type TTaskCardProps = {
    data : TUserAvailableTaskTodo
}

const TaskCard : React.FC<TTaskCardProps> = ({
    data
}) => {

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

    return (
        <div
            className={cn(
                ` w-full h-fit `,
                ` bg-card border border-border shadow `,
                `rounded-md`
            )}
            draggable={true}
            onDragStart={onDragStartHandler}
            onDragEnd={onDragEndHandler}
            onMouseDown={onMouseDownHandler}
        >
            <p
                className={cn(
                    `w-fit px-2 py-1 ml-2 mt-2 rounded bg-primary text-xs text-primary-foreground font-semibold`,
                    data.project_color !== "#ffffff" && getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                )}
                style={{
                    backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                }}
            >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
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