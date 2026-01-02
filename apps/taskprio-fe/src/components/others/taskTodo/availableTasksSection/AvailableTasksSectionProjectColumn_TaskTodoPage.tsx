import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { useGetAvailableTasksByProject } from "@/services/private/todo/query"
import { TProjectWithUserAssignedTasks, TTaskboard } from "@repo/taskprio-types/src"
import { Filter } from "lucide-react"
import React, { useLayoutEffect, useState } from "react"
import TaskCard from "./AvailableTasksSectionTaskCard_TaskTodoPage"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import NumberFlow from "@number-flow/react"
import { updateTaskTodoPageStore, useTaskTodoPageStore_projectColumnsFilterState } from "@/stores/taskTodoPage"
import { useDebounce } from "use-debounce"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

type TProjectColumnProps = {
    data : TProjectWithUserAssignedTasks,
    visible : boolean,
    drawerMode? : boolean
}

const ProjectColumn = React.forwardRef<HTMLDivElement, TProjectColumnProps>( ({
    data,
    visible,
    drawerMode = false
}, ref) => {

    const projectColumnsFilterState = useTaskTodoPageStore_projectColumnsFilterState()

    const [ searchFilter, setSearchFilter ] = useState<string>( projectColumnsFilterState[data.project_id]?.search || "" )
    const [ taskboardsFilter, setTaskboardsFilter ] = useState<string[]>( projectColumnsFilterState[data.project_id]?.taskboards || [] );

    const [ debouncedSearchFilter ] = useDebounce( searchFilter, 200 )

    const {
        data : availableTasks,
        isLoading : availableTasksIsLoading
    } = useGetAvailableTasksByProject({
        payload : {
            params : {
                project_id : data.project_id
            },
            query : {
                search : debouncedSearchFilter.trim() === "" ? undefined : debouncedSearchFilter,
                taskboards : taskboardsFilter.length < 1 ? undefined : taskboardsFilter,
            }
        },
        options : {
            enabled : visible
        }
    })

    useLayoutEffect(() => {
        const newState = {...projectColumnsFilterState}
        newState[data.project_id] = {
            search : debouncedSearchFilter,
            taskboards : taskboardsFilter
        }
        updateTaskTodoPageStore({
            projectColumnsFilterState : newState
        })
    },[
        debouncedSearchFilter,
        taskboardsFilter
    ])

    return (
        <div
            data-project-column-id={data.project_id}
            ref={ref}
            className={cn(
                ` max-w-[27rem] min-h-0 grow shrink-0 `,
                ` grid `,
                ` p-4 pb-0 space-y-4 `,
                ` rounded-md animate-in fade-in fill-mode-both duration-500 `,
                drawerMode && `p-0 pt-4 max-h-full`
            )}
            style={{
                gridTemplateRows : drawerMode ? "min-content 1fr" : "min-content min-content 1fr"
            }}
        >
            {
                !drawerMode &&
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
                        <Badge variant={"secondary"} >
                            <NumberFlow
                                prefix={(availableTasks?.tasks?.length || 0) > 99 ? "+" : undefined}
                                value={Math.min(99, (availableTasks?.tasks?.length || 0))}
                            />
                        </Badge>
                    </h3>
                </div>
            }

            <div className="flex justify-end gap-4" >
                <Input
                    placeholder="Seach"
                    value={searchFilter}
                    onChange={ e => {
                        setSearchFilter( e.currentTarget.value )
                    } }
                />
                <ProjectColumnFilterPopover
                    taskboards={data.taskboards || []}
                    taskboardsFilter={taskboardsFilter}
                    setTaskboardsFilter={setTaskboardsFilter}
                />
            </div>

            <div
                className={cn(
                    `max-h-full min-h-0 space-y-4 pb-[10rem] overflow-y-auto `
                )}
            >
                {
                    availableTasksIsLoading &&
                    Array.from({ length : 10 }).map( (_, i) => (
                        <Skeleton key={i} className="w-full h-[5rem]"/>
                    ) )
                }
                {
                    (!availableTasksIsLoading && availableTasks?.tasks?.length === 0) &&
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>No Available Tasks</EmptyTitle>
                            <EmptyDescription>
                                There are no tasks assigned to you in this project or all tasks are already added to your todo list
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                }
                {
                    (!availableTasksIsLoading && availableTasks?.tasks) &&
                    availableTasks?.tasks.map( task => <TaskCard data={task} /> )
                }
            </div>
        </div>
    )

} )

export default ProjectColumn;

type TProjectColumnFilterPopoverProps = {
    taskboards : Pick<TTaskboard, "task_board_id" | "task_board_name">[],
    taskboardsFilter : string[],
    setTaskboardsFilter : React.Dispatch<React.SetStateAction<string[]>>
}

const ProjectColumnFilterPopover : React.FC<TProjectColumnFilterPopoverProps> = ({
    taskboards,
    taskboardsFilter,
    setTaskboardsFilter
}) => {

    const handleTaskboardBadgeOnClick = ( value : string ) => {
        if ( taskboardsFilter.includes(value) ) {
            setTaskboardsFilter( prev => prev.filter( id => id !== value ) )
        } else {
            setTaskboardsFilter( prev => [...prev, value] )
        }
    }

    return (
        <Popover>
            <PopoverTrigger
                onClick={ e => {
                    e.stopPropagation()
                    e.preventDefault()
                } }
                render={
                    <Button
                        size={"icon"}
                        variant={"outline"}
                    >
                        <Filter/>
                    </Button>
                }
            />
            <PopoverContent
                portal={false}
                align="end"
                side="bottom"
                className={cn(
                    `w-[25rem] h-fit`
                )}
                onClick={ e => {
                    e.stopPropagation()
                    e.preventDefault()
                } }
            >
                <div
                    className={cn(
                        `flex flex-col gap-4 `,
                    )}
                    onClick={ e => {
                        e.stopPropagation()
                        e.preventDefault()
                    } }
                >
                    <Label>Taskboards</Label>
                    <div className="flex flex-wrap gap-2" >
                        {
                            taskboards.map( taskboard => (
                                <Badge
                                    className={cn(
                                        `cursor-pointer`,
                                        `transition-transform active:-translate-y-[0.1rem] ease-linear duration-100`
                                    )}
                                    variant={ taskboardsFilter.includes( taskboard.task_board_id ) ? "default" : "outline"}
                                    onClick={() => {
                                        handleTaskboardBadgeOnClick(taskboard.task_board_id)
                                    }}
                                >{taskboard.task_board_name}</Badge>
                            ) )
                        }
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )

}