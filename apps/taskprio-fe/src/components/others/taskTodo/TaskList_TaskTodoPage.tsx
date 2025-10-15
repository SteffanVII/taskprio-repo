import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter";
import { useMoveTaskToTodo, useRemoveTaskFromTodo, useUpdateTaskTodoState } from "@/services/private/todo/mutation";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { CheckSquareIcon, EditIcon, PauseIcon, PlayIcon, TrashIcon } from "lucide-react";
import React, { useContext, useMemo, useState } from "react";
import TagBadge from "../shared/tag/TagBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useTaskTodoPageStore, { useTaskTodoPageStore_SessionActive } from "@/stores/taskTodoPage";
import { StateManager_TaskTodoPageContext } from "./StateManager_TaskTodoPage";
import TaskTodoFinishSessionDialog from "../dialogs/TaskTodoFinishSessionDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { TUserTaskTodoState } from "@repo/taskprio-types/src";

const TaskList_TaskTodoPage = () => {

    const {
        taskTodoPageShowAvailableTasks
    } = useGlobalsStore()

    const {
        handleStartSession,
        handlePauseSession,
        userTaskTodoState
    } = useContext(StateManager_TaskTodoPageContext)

    const {
        sessionActive,
        totalCurrentWorkTimeString,
        totalWorkTimeGoalString,
        timerCount
    } = useTaskTodoPageStore()

    const [ finishSessionDialogOpen, setFinishSessionDialogOpen ] = useState(false)

    const sortedUserTaskTodoState = useMemo(() => {
        return [...userTaskTodoState!].sort( ( a, b ) => b.display_order - a.display_order )
    }, [userTaskTodoState])

    const handleSessionButtonOnClick = () => {
        if ( sessionActive ) {
            handlePauseSession()
        } else {
            handleStartSession()
        }
    }

    return (
        <div
            className={cn(
                ` relative w-full max-w-[40rem] min-w-[40rem] h-full `,
                ` grid min-h-0 `,
                !taskTodoPageShowAvailableTasks && ` max-w-full `
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <TaskTodoFinishSessionDialog
                open={finishSessionDialogOpen}
                onOpenChange={setFinishSessionDialogOpen}
            />
            <div
                className={cn(
                    `w-full h-fit`,
                    `flex justify-between`,
                    `p-4 bg-background `,
                    `border-b border-border`,
                )}
            >
                <h3>Task List</h3>
                {
                    !taskTodoPageShowAvailableTasks &&
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
                    `px-[2rem] pt-[2rem] min-h-0 `
                )}
            >
                <div
                    className={cn(
                        ` relative `,
                        ` w-full h-full min-h-0 border-x border-t rounded-t-4xl border-primary/20 `,
                        ` grid grow `,
                        `bg-gradient-to-b from-primary/20 to-accent`
                    )}
                    style={{
                        gridTemplateRows : "min-content 1fr"
                    }}
                >
                    <div
                        className={cn(
                            ` flex flex-col justify-between `,
                            ` w-full h-fit m-4 p-4 pt-[4rem] `,
                        )}
                    >
                        <div
                            className=" flex justify-center gap-8 "
                        >
                            <Tooltip>
                                <TooltipTrigger asChild >
                                    <p className=" flex gap-4 text-3xl " ><span>{ totalCurrentWorkTimeString }</span>⏲️</p>
                                </TooltipTrigger>
                                <TooltipContent>Current work time</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild >
                                    <p className=" flex gap-4 text-3xl " ><span>{ totalWorkTimeGoalString }</span>🏁</p>
                                </TooltipTrigger>
                                <TooltipContent>Work time goal</TooltipContent>
                            </Tooltip>
                        </div>
                        <div
                            className=" w-full h-[14rem] flex items-center justify-center "
                        >
                            <div
                                className=" flex gap-4 h-fit mx-auto my-[3rem] "
                            >
                                <Button
                                    size={"icon"}
                                    variant={sessionActive ? "destructive" : "default"}
                                    className={cn(
                                        ` relative size-[6rem]  `,
                                        ` cursor-pointer shadow `,
                                        ` transition-all `,
                                        ` hover:scale-110 hover:shadow-2xl `,
                                        ` active:scale-95 active:shadow-lg `,
                                        !sessionActive && ` bg-green-500 hover:bg-green-600 `
                                    )}
                                    onClick={handleSessionButtonOnClick}
                                >
                                    {
                                        sessionActive &&
                                        <div className="absolute top-0 left-0 size-full rounded-full bg-destructive/50 animate-ping delay-500" ></div>
                                    }
                                    { sessionActive ? <PauseIcon className=" size-[50%] " /> : <PlayIcon className=" size-[50%] " /> }   
                                </Button>
                                {
                                    !sessionActive &&
                                    <div>
                                        <Button onClick={() => setFinishSessionDialogOpen(true)} >Finish Session</Button>
                                    </div>
                                }
                            </div>
                        </div>

                    </div>

                    <ScrollArea
                        className="relative flex flex-col w-full h-full min-h-full "
                    >
                        <div
                            className={cn(
                                `grow flex flex-col`,
                                `size-full max-w-[30rem] mx-auto p-4`,
                                sessionActive && `pt-[1.55rem] gap-[0.5rem] `
                            )}
                        >
                            <React.Fragment>
                                {
                                    userTaskTodoState &&
                                    userTaskTodoState.length === 0 &&
                                    <TaskCardDrop
                                        displayOrder={0}
                                        fullSize
                                    />
                                }
                                {
                                    userTaskTodoState &&
                                    sortedUserTaskTodoState.map( ( task, taskIndex ) => {

                                        const singleTask = sortedUserTaskTodoState.length === 1;
                                        const firstTask = taskIndex === 0;
                                        const lastTask = taskIndex === sortedUserTaskTodoState.length - 1;

                                        const adjacentTop = firstTask && !singleTask ? null : sortedUserTaskTodoState[ taskIndex - 1 ]
                                        const adjacentBottom = lastTask && !singleTask ? null : sortedUserTaskTodoState[ taskIndex + 1 ]

                                        const displayOrderTop = firstTask ? task.display_order + 100 : ( adjacentTop!.display_order + task.display_order ) / 2
                                        const displayOrderBottom = lastTask ? task.display_order - 100 : ( adjacentBottom!.display_order + task.display_order ) / 2

                                        return (
                                            <React.Fragment key={task.task_id}>
                                                {
                                                    firstTask && !sessionActive &&
                                                    <TaskCardDrop
                                                        displayOrder={displayOrderTop}
                                                        bottomTaskId={task?.task_id}
                                                    />
                                                }
                                                <TaskCard
                                                    key={ taskIndex === 0 ? totalCurrentWorkTimeString + task.current_work_time : task.task_id + task.current_work_time}
                                                    data={task}
                                                    timerCount={ taskIndex === 0 ? timerCount : undefined }
                                                    active={taskIndex === 0 && sessionActive}
                                                />
                                                {
                                                    !sessionActive &&
                                                    <TaskCardDrop
                                                        displayOrder={displayOrderBottom}
                                                        topTaskId={task?.task_id}
                                                        bottomTaskId={adjacentBottom?.task_id}
                                                        fullSize={lastTask}
                                                    />
                                                }
                                            </React.Fragment>
                                        )

                                    } )
                                }
                            </React.Fragment>
                        </div>
                    </ScrollArea>

                </div>
            </div>
        </div>
    )

}

export default TaskList_TaskTodoPage;

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

    const sessionActive = useTaskTodoPageStore_SessionActive()
    
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
            }
        })
    }

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
                ` bg-background border border-border rounded-2xl `,
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
                    `w-fit px-2 py-1 ml-2 mt-2 rounded-md bg-primary text-xs text-primary-foreground font-semibold`,
                    getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
                )}
                style={{
                    backgroundColor : data.project_color === "#ffffff" ? undefined : data.project_color
                }}
            >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
            <div className=" flex justify-between " >
                <p
                    className={cn(
                        ` text-lg font-medium p-3 `
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
                    ` p-4 `
                )}
            >
                <div className=" flex gap-2 justify-end items-center " >
                    <p className=" text-lg " >{ formatTaskTodoTimeSeconds(currentWorkTime + (timerCount ?? 0))} ⏱️</p>/
                    <p className=" text-lg " >{ formatTaskTodoTimeSeconds(workTimeGoal) } 🏁</p>
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
                        value={[currentWorkTime]}
                        min={0}
                        max={workTimeGoal}
                        step={1}
                        disabled
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

} )

type TTaskCardDropProps = {
    displayOrder : number,
    fullSize? : boolean,
    topTaskId? : string,
    bottomTaskId? : string
}

const TaskCardDrop : React.FC<TTaskCardDropProps> = ({
    displayOrder,
    fullSize,
    topTaskId,
    bottomTaskId
}) => {

    const {
        taskboardTaskTodoDrag : {
            taskboardTaskTodo
        }
    } = useGlobalsStore()

    const [ draggedOver, setDraggedOver ] = useState(false)

    const {
        mutateAsync : moveTaskToTodoTrigger
    } = useMoveTaskToTodo()

    const {
        mutateAsync : updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState()

    const onDragOverHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        e.preventDefault();
        if ( taskboardTaskTodo && taskboardTaskTodo.task_id !== topTaskId && taskboardTaskTodo.task_id !== bottomTaskId ) {
            e.dataTransfer.setData( "displayOrder", displayOrder.toString() )
            setDraggedOver(true)
        }
    }

    const onDragLeaveHandler = ( e : React.DragEvent<HTMLDivElement> ) => {
        e.stopPropagation()
        setDraggedOver(false)
    }

    const onDropHandler = () => {

        if ( taskboardTaskTodo ) {
            if ( !topTaskId && !bottomTaskId ) {
                moveTaskToTodoTrigger({
                    pathParameters : {
                        task_id : taskboardTaskTodo.task_id
                    },
                    body : {
                        display_order : displayOrder
                    },
                    optimisticHelpers : {
                        task : taskboardTaskTodo
                    }
                })
            } else {
                if ( "active" in taskboardTaskTodo ) {
                    if ( taskboardTaskTodo.active ) {
                        updateTaskTodoStateTrigger({
                            pathParameters : {
                                task_id : taskboardTaskTodo.task_id
                            },
                            body : {
                                display_order : displayOrder,
                                active : true
                            }
                        })
                    } else {
                        moveTaskToTodoTrigger({
                            pathParameters : {
                                task_id : taskboardTaskTodo.task_id
                            },
                            body : {
                                display_order : displayOrder
                            },
                            optimisticHelpers : {
                                task : taskboardTaskTodo
                            }
                        })
                    }
                }
            }
        }

        setDraggedOver( false )

    }

    return (
        <div
            className={cn(
                `relative`,
                `flex items-center`,
                `h-[1rem] w-full`,
                draggedOver && ` h-[6rem] `,
                fullSize && ` h-full `
            )}
        >
            <div
                className={cn(
                    `absolute top-1/2 -translate-y-1/2`,
                    ` h-[calc(100%+1rem)] w-full `,
                    ` pointer-events-none `,
                    taskboardTaskTodo && ` pointer-events-auto `
                )}
                onDragOver={onDragOverHandler}
                onDragLeave={onDragLeaveHandler}
                onDrop={onDropHandler}
            ></div>
            <div
                className={cn(
                    ` w-full h-[0rem] my-auto rounded-md `,
                    ` border-blue-300 bg-blue-300/10 `,
                    ` pointer-events-none `,
                    fullSize && ` mt-auto `,
                    draggedOver && !fullSize && ` border h-[3rem]  `,
                    draggedOver && fullSize && ` border h-[calc(100%-2rem)] `
                )}
            ></div>
        </div>
    )

}