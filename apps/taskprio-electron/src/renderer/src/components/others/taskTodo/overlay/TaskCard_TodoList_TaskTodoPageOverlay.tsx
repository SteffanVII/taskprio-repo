import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { useCommitTaskTodo, useCompleteTaskTodo, useRemoveTaskFromTodo, useUpdateTaskTodoState } from "@/services/private/todo/mutation"
import { ETaskTodoPageDragType, updateTaskboardDragStore } from "@/stores/taskboardDrag"

import { TUserTaskTodoState } from "@repo/taskprio-types"
import { CheckSquareIcon, EditIcon, GitCommitVertical, TrashIcon, XSquare } from "lucide-react"
import React, { useMemo, useState } from "react"
import { useTaskTodoPageStore_sessionActive } from "@/stores/taskTodoPage"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type TTaskCardProps = {
    data: TUserTaskTodoState,
    // active would be true if the session is active and this todo is the top todo
    active?: boolean,
    timerCount?: number,
}

const TaskCard: React.FC<TTaskCardProps> = React.memo(({
    data,
    active,
    timerCount,
}) => {

    const sessionActive = useTaskTodoPageStore_sessionActive()

    const {
        mutateAsync: updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState()

    const {
        mutateAsync: removeTaskFromTodoTrigger
    } = useRemoveTaskFromTodo()

    const {
        mutateAsync: commitTaskTodoTrigger
    } = useCommitTaskTodo()

    const {
        mutateAsync: completeTaskTodoTrigger
    } = useCompleteTaskTodo()

    const [editMode, setEditMode] = useState(false)

    const [workTimeGoal, setWorkTimeGoal] = useState<number>(Number(data.work_time_goal))
    // const [ currentWorkTime, _setCurrentWorkTime ] = useState<number>(Number(data.current_work_time))
    const [deepWork, setDeepWork] = useState<boolean>(Number(data.work_time_goal) >= 3600)

    const totalWorkTime = useMemo(() => {
        if (data.timers && data.timers.length > 0) {
            const total = data.timers.reduce((accu, curr) => {
                let time = 0;
                if (curr.stop) {
                    const startDate = dayjs(curr.start)
                    const stopDate = dayjs(curr.stop)
                    time = stopDate.diff(startDate, "seconds")
                }
                return accu + time
            }, 0)
            return total
        }
        return 0
    }, [data])

    const workTimeGoalExceeded = useMemo(() => {
        return (totalWorkTime + (active ? timerCount ?? 0 : 0)) > workTimeGoal
    }, [
        totalWorkTime,
        workTimeGoal,
        timerCount,
        active
    ])

    const handleEditModeOnClick = () => {
        setEditMode(!editMode)
        if (editMode) {
            handleUpdateTaskTodoWorkTimeGoalState()
        }
    }

    const handleCommitOnClick = async () => {
        await commitTaskTodoTrigger({
            pathParameters: {
                task_id: data.task_id
            },
            optimisticHelpers: {
                task: data
            }
        })
    }

    const handleRemoveOnClick = async () => {
        await removeTaskFromTodoTrigger({
            pathParameters: {
                task_id: data.task_id
            },
            optimisticHelpers: {
                task: data
            }
        })
    }

    const handleCompleteOnClick = async () => {
        await completeTaskTodoTrigger({
            pathParameters: {
                task_id: data.task_id
            },
            body: {
                completed: !data.completed
            }
        })
    }

    const onDragStartHandler = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation()
        updateTaskboardDragStore({
            taskboardTaskTodoDrag: {
                taskboardTaskTodo: data,
                type: ETaskTodoPageDragType.TODO
            }
        })
    }

    const onDragEndHandler = () => {
        updateTaskboardDragStore({
            taskboardTaskTodoDrag: {
                taskboardTaskTodo: null,
                type: ETaskTodoPageDragType.TODO
            }
        })
    }

    const handleUpdateTaskTodoWorkTimeGoalState = async () => {
        await updateTaskTodoStateTrigger({
            pathParameters: {
                task_id: data.task_id
            },
            body: {
                work_time_goal: workTimeGoal
            }
        })
    }

    return (
        <div
            className={cn(
                ` group/taskcard relative `,
                ` w-full max-w-[30rem] h-fit mx-auto `,
                // ` bg-background border border-border rounded-2xl `,
                ` bg-card border border-border`,
                `rounded-md`,
                `transition-all duration-500`,
                `origin-bottom`,
                data.completed && `bg-green-300/10 border-green-400/30`,
                sessionActive && `
                    [&:first-child]:delay-300
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
                // sessionActive && currentWorkTime > workTimeGoal && `
                //     [&:first-child]:shadow-destructive/50
                // `
            )}
            draggable={true}
            onDragStart={onDragStartHandler}
            onDragEnd={onDragEndHandler}
        >
            <div className="flex items-start" >
                <p
                    className={cn(
                        `w-fit px-2 py-1 mt-2 ml-2 rounded-lg bg-primary text-xs text-primary-foreground font-semibold`,
                        getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                    )}
                    style={{
                        backgroundColor: data.project_color === "#ffffff" ? undefined : data.project_color
                    }}
                >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
                <p
                    className={cn(
                        `text-sm font-medium p-3 `,
                        data.completed && `line-through`
                    )}
                >{data.task_title}</p>
            </div>
            {
                !active &&
                <div
                    className={cn(
                        "absolute top-2 right-2 flex items-center ",
                        `p-1 px-2 rounded border bg-muted shadow-lg`,
                        `opacity-0 transition-opacity`,
                        `group-hover/taskcard:opacity-100`,
                    )}
                >
                    {
                        !data.completed &&
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    size={"icon-sm"}
                                    variant={"ghost"}
                                    className={cn(
                                        `cursor-pointer`,
                                        `rounded`,
                                        `opacity-0 transition-opacity`,
                                        `group-hover:opacity-100`,
                                        editMode && `opacity-100`
                                    )}
                                    onClick={handleEditModeOnClick}
                                >
                                    {
                                        editMode ? <CheckSquareIcon /> : <EditIcon />
                                    }
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{editMode ? "Save" : "Edit"}</TooltipContent>
                        </Tooltip>
                    }
                    {
                        data.completed &&
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    size={"icon-sm"}
                                    variant={"ghost"}
                                    className={cn(
                                        `cursor-pointer`,
                                        `rounded`,
                                        `opacity-0 transition-opacity`,
                                        `group-hover:opacity-100`,
                                        editMode && `opacity-100`
                                    )}
                                    onClick={handleCompleteOnClick}
                                >
                                    <XSquare />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark Incomplete</TooltipContent>
                        </Tooltip>
                    }
                    {
                        (!editMode && !data.completed) &&
                        <>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        size={"icon-sm"}
                                        variant={"ghost"}
                                        className={cn(
                                            `cursor-pointer`,
                                            `rounded`,
                                            `opacity-0 transition-opacity`,
                                            `group-hover:opacity-100`
                                        )}
                                        onClick={handleCompleteOnClick}
                                    >
                                        <CheckSquareIcon />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark Complete</TooltipContent>
                            </Tooltip>
                            <Dialog>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <DialogTrigger
                                                render={
                                                    <Button
                                                        size={"icon-sm"}
                                                        variant={"ghost"}
                                                        className={cn(
                                                            `cursor-pointer`,
                                                            `rounded`,
                                                            `opacity-0 transition-opacity`,
                                                            `group-hover:opacity-100`
                                                        )}
                                                    ><GitCommitVertical /></Button>
                                                }
                                            >
                                            </DialogTrigger>
                                        }
                                    />
                                    <TooltipContent>Commit</TooltipContent>
                                </Tooltip>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Commit Task</DialogTitle>
                                        <DialogDescription>Commiting this task will log the work time you spent on it.</DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleCommitOnClick}
                                        >
                                            Commit
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <DialogTrigger
                                                render={
                                                    <Button
                                                        size={"icon-sm"}
                                                        variant={"ghost"}
                                                        className={cn(
                                                            `cursor-pointer`,
                                                            `rounded`,
                                                            `opacity-0 transition-opacity`,
                                                            `group-hover:opacity-100`
                                                        )}
                                                    ><TrashIcon className=" text-destructive " /></Button>
                                                }
                                            >
                                            </DialogTrigger>
                                        }
                                    />
                                    <TooltipContent>Remove</TooltipContent>
                                </Tooltip>
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

            <div
                className={cn(
                    ` flex flex-col gap-4 `,
                    ` px-4 pb-2 `,
                    editMode && `pb-4`
                )}
            >
                <div className="flex gap-4 items-center" >
                    <Progress
                        key={workTimeGoalExceeded.toString()}
                        destructive={workTimeGoalExceeded}
                        value={totalWorkTime + (timerCount ?? 0)}
                        max={workTimeGoal}
                    />
                    <div className=" flex gap-2 justify-end items-center text-nowrap text-muted-foreground " >
                        {/* <p className=" text-lg " >{ formatTaskTodoTimeSeconds(currentWorkTime + (timerCount ?? 0))} ⏱️</p>/ */}
                        <p className=" text-sm " >{formatTaskTodoTimeSeconds(totalWorkTime + (timerCount ?? 0))}</p>/
                        <p className=" text-sm " >{formatTaskTodoTimeSeconds(workTimeGoal)}</p>
                    </div>
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
                                onCheckedChange={() => {
                                    if (deepWork) {
                                        setWorkTimeGoal(900)
                                        setDeepWork(false)
                                    } else {
                                        setWorkTimeGoal(3600)
                                        setDeepWork(true)
                                    }
                                }}
                            />
                            <Label htmlFor="deepWork" className="!text-xs" >Deep Work</Label>
                        </div>
                        <Slider
                            value={[workTimeGoal]}
                            onValueChange={value => setWorkTimeGoal(value[0])}
                            min={deepWork ? 3600 : 900}
                            max={deepWork ? 86400 : 3600}
                            step={300}
                        />
                    </>
                }
            </div>
        </div>
    )

})

export default TaskCard;
