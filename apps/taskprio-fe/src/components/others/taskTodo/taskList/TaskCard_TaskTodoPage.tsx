import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { useRemoveTaskFromTodo, useUpdateTaskTodoState } from "@/services/private/todo/mutation"
import { updateTaskboardDragStore } from "@/stores/taskboardDrag"

import { TUserTaskTodoState } from "@repo/taskprio-types/src"
import { CheckSquareIcon, EditIcon, TrashIcon } from "lucide-react"
import React, { useMemo, useState } from "react"
import TagBadge from "../../shared/tag/TagBadge"
import { useTaskTodoPageStore_sessionActive } from "@/stores/taskTodoPage"

type TTaskCardProps = {
    data : TUserTaskTodoState,
    active? : boolean,
    timerCount? : number,
}

const TaskCard : React.FC<TTaskCardProps> = React.memo( ({
    data,
    active,
    timerCount,
}) => {

    const sessionActive = useTaskTodoPageStore_sessionActive()
    
    const {
        mutateAsync : updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState()

    const {
        mutateAsync : removeTaskFromTodoTrigger
    } = useRemoveTaskFromTodo()

    const [ editMode, setEditMode ] = useState( false )

    const [ workTimeGoal, setWorkTimeGoal ] = useState<number>(Number(data.work_time_goal))
    const [ currentWorkTime, _setCurrentWorkTime ] = useState<number>(Number(data.current_work_time))
    const [ deepWork, setDeepWork ] = useState<boolean>(Number(data.work_time_goal) >= 3600)

    const totalWorkTime = useMemo(() => {
        if ( data.timers && data.timers.length > 0 ) {
            const total = data.timers.reduce( (accu, curr) => {
                let time = 0;
                if ( curr.stop ) {           
                    const startDate = dayjs(curr.start)
                    const stopDate = dayjs(curr.stop)
                    time = stopDate.diff( startDate, "seconds" )
                }
                return accu + time
            }, 0 )
            return total
        }
        return 0
    }, [data])

    const handleEditModeOnClick = () => {
        setEditMode(!editMode)
        if ( editMode ) {
            handleUpdateTaskTodoWorkTimeGoalState()
        }
    }

    const handleRemoveOnClick = async () => {
        await removeTaskFromTodoTrigger({
            pathParameters : {
                task_id : data.task_id
            },
            optimisticHelpers : {
                task : data
            }
        })
    }

    const onDragStartHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        updateTaskboardDragStore({
            taskboardTaskTodoDrag: {
                taskboardTaskTodo: data
            }
        })
    }

    const onDragEndHandler = () => {
        updateTaskboardDragStore({
            taskboardTaskTodoDrag: {
                taskboardTaskTodo: null
            }
        })
    }

    const handleUpdateTaskTodoWorkTimeGoalState = async () => {
        await updateTaskTodoStateTrigger({
            pathParameters : {
                task_id : data.task_id
            },
            body : {
                work_time_goal : workTimeGoal
            }
        })
    }

    return (
        <div
            className={cn(
                ` group `,
                ` w-full max-w-[30rem] h-fit mx-auto `,
                // ` bg-background border border-border rounded-2xl `,
                ` bg-card border border-border shadow `,
                `rounded-md`,
                `transition-all duration-500`,
                `origin-bottom`,
                sessionActive && `
                    [&:first-child]:shadow-2xl [&:first-child]:shadow-primary/50 [&:first-child]:delay-300
                    [&:not(:first-child)]:opacity-25
                    [&:not(:first-child)]:scale-90
                    [&:not(:first-child)]:delay-100
                    [&:not(:first-child)]:pointer-events-none
                    [&:not(:first-child)]:shadow
                    [&:nth-child(2)]:scale-95
                    [&:nth-child(2)]:delay-0
                    [&:nth-child(2)]:opacity-75
                    [&:nth-child(3)]:opacity-50
                `,
                sessionActive && currentWorkTime > workTimeGoal && `
                    [&:first-child]:shadow-destructive/50
                `
            )}
            draggable={true}
            onDragStart={onDragStartHandler}
            onDragEnd={onDragEndHandler}
        >
            <p
                className={cn(
                    `w-fit px-2 py-1 ml-2 mt-2 rounded bg-primary text-xs text-primary-foreground font-semibold`,
                    getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                )}
                style={{
                    backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                }}
            >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
            <div className=" flex justify-between " >
                <p
                    className={cn(
                        `text-sm font-medium p-3 `
                    )}
                >{data.task_title}</p>
                {
                    !active &&
                    <div className=" flex items-center gap-4 m-4 " >
                        <button
                            className={cn(
                                `cursor-pointer`,
                                `opacity-0 transition-opacity`,
                                `group-hover:opacity-100`,
                                editMode && `opacity-100`
                            )}
                            onClick={handleEditModeOnClick}
                        >
                            {
                                editMode ? <CheckSquareIcon className=" text-primary size-[1.2rem] " /> : <EditIcon className=" size-[1.2rem] " />
                            }
                        </button>
                        {
                            !editMode &&
                            <>
                                <Dialog>
                                    <DialogTrigger asChild >
                                        <button
                                            className={cn(
                                                `cursor-pointer`,
                                                `opacity-0 transition-opacity`,
                                                `group-hover:opacity-100`
                                            )}
                                        ><TrashIcon className=" text-destructive size-[1.2rem] " /></button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Are you sure you want to remove this task?</DialogTitle>
                                            <DialogDescription>Removing this task from your todo will discard the current work time you have tracked on it.</DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant={"destructive"}
                                                onClick={handleRemoveOnClick}
                                            >
                                                Yes, I'm sure.
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        }
                    </div>
                }
            </div>
            <div
                className={cn(
                    ` flex flex-col gap-4 `,
                    ` px-4 `
                )}
            >
                <div className=" flex gap-2 justify-end items-center " >
                    {/* <p className=" text-lg " >{ formatTaskTodoTimeSeconds(currentWorkTime + (timerCount ?? 0))} ⏱️</p>/ */}
                    <p className=" text-sm " >{ formatTaskTodoTimeSeconds(totalWorkTime + (timerCount ?? 0))}</p>/
                    <p className=" text-sm " >{ formatTaskTodoTimeSeconds(workTimeGoal) }</p>
                </div>
                {/* {
                    active &&
                } */}
                <div
                    className={cn(
                        `opacity-0 transition-opacity`,
                        active && `opacity-100`
                    )}
                >
                    <Slider
                        value={[totalWorkTime + (timerCount??0)]}
                        min={0}
                        max={workTimeGoal}
                        step={1}
                        hideThumb
                    />
                </div>
                {
                    editMode &&
                    <>
                        <div className={cn(
                            `w-fit flex items-center gap-4`,
                            `bg-primary/70 text-primary-foreground px-2 py-2 rounded-md`
                        )} >
                            <Switch
                                id="deepWork"
                                checked={deepWork}
                                onCheckedChange={ () => {
                                    if ( deepWork ) {
                                        setWorkTimeGoal(900)
                                        setDeepWork(false)
                                    } else {
                                        setWorkTimeGoal(3600)
                                        setDeepWork(true)
                                    }
                                } }
                            />
                            <Label htmlFor="deepWork" className="!text-xs" >Deep Work</Label>
                        </div>
                        <Slider
                            value={[workTimeGoal]}
                            onValueChange={ value => setWorkTimeGoal(value[0]) }
                            min={ deepWork ? 3600 : 900 }
                            max={ deepWork ? 86400 : 3600 }
                            step={ 300 }
                        />
                    </>
                }
            </div>
            {
                data.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 `,
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

} )

export default TaskCard;
