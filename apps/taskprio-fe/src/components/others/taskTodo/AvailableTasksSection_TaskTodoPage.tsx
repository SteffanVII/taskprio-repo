import { cn } from "@/lib/utils";
import { useGetTasksAssignedToUserByWorkspace } from "@/services/private/todo/query";
import React from "react";
import { useParams } from "react-router";
import TagBadge from "../shared/tag/TagBadge";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useTaskTodoPageStore from "@/stores/taskTodoPage";
import { ScrollArea } from "@/components/ui/scroll-area";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { TUserAvailableTaskTodo, TUserAvailableTaskTodoByProject } from "@repo/taskprio-types/src";

const AvailableTasksSection_TaskTodoPage = () => {

    const { workspace_id } = useParams()

    const {
        taskTodoPageShowAvailableTasks
    } = useGlobalsStore()

    const {
        data : assignedTasksGroups,
        isLoading : assignedTasksGroupsIsLoading
    } = useGetTasksAssignedToUserByWorkspace({
        pathParameter : {
            workspace_id
        }
    })

    return (
        <div
            className={cn(
                ` w-full h-full min-h-0 `,
                ` grid grow `
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <div
                className={cn(
                    `w-full h-fit`,
                    ` flex justify-between `,
                    `p-4 bg-background`,
                    `border-b border-border`
                )}
            >
                <h3>Available Tasks</h3>
                {
                    taskTodoPageShowAvailableTasks &&
                    <div className=" flex items-center gap-4 " >
                        <Switch
                            id="taskTodoPageShowAvailableTasks"
                            checked={taskTodoPageShowAvailableTasks}
                            onCheckedChange={ checked => {
                                updateGlobalsStore({
                                    taskTodoPageShowAvailableTasks : checked
                                })
                            } }
                        />
                        <Label htmlFor="taskTodoPageShowAvailableTasks" >Show Available Tasks</Label>   
                    </div>
                }
            </div>
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
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <div>
                <h3
                    className={cn(
                        " px-3 py-2 bg-primary rounded-md text-lg text-primary-foreground ",
                        data.project_color !== "#ffffff" && getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                    )}
                    style={{
                        backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                    }}
                >{data.project_name}</h3>
            </div>

            <ScrollArea
                className="relative flex flex-col w-full h-full min-h-full "
            >
                <div
                    className={cn(
                        ` space-y-4 `
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
        updateGlobalsStore({
            taskboardTaskTodoDrag : {
                taskboardTaskTodo : data
            }
        })
    }

    const onDragEndHandler = () => {
        updateGlobalsStore({
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
                ` bg-background border border-border rounded-2xl `
            )}
            draggable={true}
            onDragStart={onDragStartHandler}
            onDragEnd={onDragEndHandler}
            onMouseDown={onMouseDownHandler}
        >
            <p
                className={cn(
                    `w-fit px-2 py-1 ml-2 mt-2 rounded-md bg-primary text-xs text-primary-foreground font-semibold`,
                    data.project_color !== "#ffffff" && getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                )}
                style={{
                    backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                }}
            >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
            <p
                className={cn(
                    ` p-3 `
                )}
            >{data.task_title}</p>
            {
                data.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 overflow-hidden rounded-bl-[0.3rem] `,
                            ` m-3 `
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