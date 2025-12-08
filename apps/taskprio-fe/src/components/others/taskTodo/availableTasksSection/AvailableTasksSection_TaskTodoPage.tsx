import { cn } from "@/lib/utils";
import { useGetTasksAssignedToUserByWorkspace } from "@/services/private/todo/query";
import React from "react";
import { useParams } from "react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { TUserAvailableTaskTodo, TUserAvailableTaskTodoByProject } from "@repo/taskprio-types/src";
import TagBadge from "../../shared/tag/TagBadge";
import { Badge } from "@/components/ui/badge";
import { updateTaskboardDragStore } from "@/stores/taskboardDrag";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

const AvailableTasksSection_TaskTodoPage = () => {

    const { workspace_id } = useParams()

    const {
        data : assignedTasksGroups,
        // isLoading : assignedTasksGroupsIsLoading
    } = useGetTasksAssignedToUserByWorkspace({
        pathParameter : {
            workspace_id
        }
    })

    return (
        <div
            className={cn(
                ` w-full h-full min-h-0 `,
                ` flex flex-col grow `,
            )}
            // style={{
            //     gridTemplateRows : "min-content 1fr"
            // }}
        >
            <div
                className={cn(
                    ` w-full h-full min-h-0 grow overflow-x-auto overflow-y-hidden `,
                    ` flex grow flex-nowrap space-x-4 `,
                    ` p-4 pb-0 `,
                    ` cursor-grab active:cursor-grabbing select-none `
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
                    ( assignedTasksGroups && assignedTasksGroups.length === 0 ) &&
                    <p className=" mx-auto mt-[8rem] text-lg font-semibold " >No available tasks</p>
                }
                {
                    assignedTasksGroups &&
                    assignedTasksGroups.map( group => <ProjectColumn data={group} /> )
                }
            </div>

        </div>
    )

}

export default AvailableTasksSection_TaskTodoPage;

type TProjectColumnProps = {
    data : TUserAvailableTaskTodoByProject
}

const ProjectColumn : React.FC<TProjectColumnProps> = ({
    data
}) => {

    return (
        <div
            className={cn(
                ` max-w-[27rem] min-h-0 grow shrink-0 `,
                ` grid `,
                ` p-4 pb-0 space-y-4 `,
                ` rounded-md `
            )}
            style={{
                gridTemplateRows : "min-content min-content 1fr"
            }}
        >
            <div>
                <h3
                    className={cn(
                        "flex justify-between items-center px-3 py-2 bg-primary rounded-md text-lg text-primary-foreground ",
                        data.project_color !== "#ffffff" && getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                    )}
                    style={{
                        backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                    }}
                >
                    {data.project_name}
                    <Badge variant={"secondary"} >{data.tasks.length > 99 ? "99+" : data.tasks.length}</Badge>
                </h3>
            </div>

            <div className="flex justify-end gap-2" >
                <Input
                    placeholder="Seach"
                />
                <Button
                    size={"icon"}
                    variant={"ghost"}
                >
                    <Search/>
                </Button>
                <Button
                    size={"icon"}
                    variant={"ghost"}
                >
                    <Filter/>
                </Button>
            </div>

            <ScrollArea
                className="relative flex flex-col w-full h-full min-h-full "
            >
                <div
                    className={cn(
                        ` space-y-4 pb-[10rem] `
                    )}
                >
                    {
                        data.tasks.map( task => <TaskCard data={task} /> )
                    }
                </div>
            </ScrollArea>
        </div>
    )

}

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