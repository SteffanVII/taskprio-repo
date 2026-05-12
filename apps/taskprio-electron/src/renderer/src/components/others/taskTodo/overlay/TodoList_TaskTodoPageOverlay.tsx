import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateTaskTodoPageStore, useTaskTodoPageStore_sessionActive, useTaskTodoPageStore_timerCount, useTaskTodoPageStore_totalCurrentWorkTimeNumber, useTaskTodoPageStore_totalCurrentWorkTimeString, useTaskTodoPageStore_totalWorkTimeGoalNumber, useTaskTodoPageStore_userTaskTodoStateIsLoading } from "@/stores/taskTodoPage";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Eye, Moon, Pause, Play, Plus } from "lucide-react";
import React, { useContext, useMemo, useRef, useState } from "react";
import TaskCardDrop from "../taskList/TaskCardDrop_TaskTodoPage";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTodoFinishSessionDialog from "../../dialogs/TaskTodoFinishSessionDialog";
import TaskCard from "./TaskCard_TodoList_TaskTodoPageOverlay";
import AvailableTasksDrawer_TaskTodoPageOverlay from "./AvailableTasksDrawer_TaskTodoPageOverlay";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import Spinner from "../../Spinner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const TodoList_TaskTodoPageOverlay = () => {


    const userTaskTodoStateIsLoading = useTaskTodoPageStore_userTaskTodoStateIsLoading()

    const {
        handleStartSession,
        handlePauseSession,
        userTaskTodoState
    } = useContext(StateManager_TaskTodoPageContext)

    const {
        switchToFocusModeFromOverlayMode
    } = useContext(StateManager_ElectronContext)

    const sessionActive = useTaskTodoPageStore_sessionActive()
    const totalCurrentWorkTimeString = useTaskTodoPageStore_totalCurrentWorkTimeString()
    const totalCurrentWorkTimeNumber = useTaskTodoPageStore_totalCurrentWorkTimeNumber()
    const totalWorkTimeGoalNumber = useTaskTodoPageStore_totalWorkTimeGoalNumber()
    const timerCount = useTaskTodoPageStore_timerCount()

    const [ finishSessionDialogOpen, setFinishSessionDialogOpen ] = useState(false)
    const [ availableTasksDrawerOpen, setAvailableTasksDrawerOpen ] = useState<boolean>(false)
    const [ loading, setLoading ] = useState<boolean>(false)

    const taskListContainerRef = useRef<HTMLDivElement>(null)

    const sortedUserTaskTodoState = useMemo(() => {
        const returnValue = [...(userTaskTodoState || [])!].filter( task => !task.completed ).sort( ( a, b ) => b.display_order - a.display_order )
        updateTaskTodoPageStore({
            topTaskTodo : returnValue[0] ?? null
        })
        return returnValue
    }, [userTaskTodoState])

    const completedUseTaskTodoState = useMemo(() => {
        return [...(userTaskTodoState || [])!].filter( todo => todo.completed )
    }, [userTaskTodoState])

    const handleSessionButtonOnClick = async () => {
        setLoading(true)
        if ( sessionActive ) {
            await handlePauseSession()
        } else {
            await handleStartSession()
        }
        setLoading(false)
        if ( taskListContainerRef.current ) {
            taskListContainerRef.current.scrollTo({
                top : 0,
                behavior : "smooth"
            })
        }
    }

    return (
        <div
            className={cn(
                `grid`,
                `min-h-full`
            )}
            style={{
                gridTemplateRows : "min-content 1fr min-content"
            }}
        >
            {/* <div
                className={cn(
                    "absolute z-[1] w-[20rem] h-[3rem] scale-50 top-[14rem] left-1/2 translate-x-[-50%] shadow-[0_3rem_14rem_0.7rem] shadow-primary bg-transparent",
                    `opacity-0 transition-all duration-[3000ms]`,
                    sessionActive && `opacity-100 scale-100`
                )}
            ></div> */}
            <TaskTodoFinishSessionDialog
                open={finishSessionDialogOpen}
                onOpenChange={setFinishSessionDialogOpen}
            />
            <AvailableTasksDrawer_TaskTodoPageOverlay
                open={availableTasksDrawerOpen}
                setOpen={setAvailableTasksDrawerOpen}
            />
            <div
                className={cn(
                    `flex flex-col`,
                    // `bg-gradient-to-t from-card to-card/0`,
                    // `border z-[2]`,
                    `z-[2]`,
                    `mx-4 mt-4 rounded-3xl transition-all ease-initial duration-200`,
                    // sessionActive && `border-4 border-primary from-primary/20`
                )}
            >
                {/* Timer */}
                <div
                    className={cn(
                        `flex items-center justify-between gap-4`,
                        `mx-4 bg-transparent`,
                        `rounded-3xl`,
                    )}
                >
                    <NumberFlowGroup>
                        <div className="text-5xl font-bold" >
                            <NumberFlow
                                value={ Math.floor( totalCurrentWorkTimeNumber / 3600 ) }
                            />
                            <NumberFlow
                                prefix=":"
                                value={Math.floor((totalCurrentWorkTimeNumber % 3600) / 60)}
                                digits={{ 1: { max: 5 } }}
                                format={{ minimumIntegerDigits: 2 }}
                                />
                            <NumberFlow
                                prefix=":"
                                value={totalCurrentWorkTimeNumber % 60}
                                digits={{ 1: { max: 5 } }}
                                format={{ minimumIntegerDigits: 2 }}
                            />
                        </div>
                    </NumberFlowGroup>
                    <div
                        className={cn(
                            `flex gap-4`
                        )}
                    >
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <Button
                                        size={"icon-lg"}
                                        variant={"outline"}
                                        onClick={() => setFinishSessionDialogOpen(true)}
                                        className={cn(
                                            `transition-all duration-500`,
                                            sessionActive && `!opacity-0 -translate-x-full`
                                        )}
                                        disabled={sessionActive || sortedUserTaskTodoState.length === 0}
                                    >
                                        <Moon/>
                                    </Button>
                                }
                            />
                            <TooltipContent>Commit Session</TooltipContent>
                        </Tooltip>
                        <Button
                            size={"icon-lg"}
                            variant={ sessionActive ? "destructive" : "secondary"}
                            className={cn(
                                `transition-transform`,
                                `hover:scale-125`
                            )}
                            onClick={handleSessionButtonOnClick}
                            disabled={sortedUserTaskTodoState.length === 0}
                        >
                            {
                                loading ?
                                <Spinner/>
                                :
                                sessionActive ?
                                <Pause/>
                                :
                                <Play/>
                            }
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4 pb-2" >
                    <Progress
                        value={totalCurrentWorkTimeNumber}
                        max={totalWorkTimeGoalNumber}
                    />
                    <NumberFlowGroup>
                        <div className="font-bold text-nowrap" >
                            <NumberFlow
                                value={ Math.floor( totalWorkTimeGoalNumber / 3600 ) }
                            />
                            <NumberFlow
                                prefix=":"
                                value={Math.floor((totalWorkTimeGoalNumber % 3600) / 60)}
                                digits={{ 1: { max: 5 } }}
                                format={{ minimumIntegerDigits: 2 }}
                                />
                        </div>
                    </NumberFlowGroup>
                </div>
            </div>
            <div
                ref={taskListContainerRef}
                className={cn(
                    `flex flex-col`,
                    `min-h-0 h-full max-h-full overflow-y-auto`,
                    `mx-4 mt-4 z-[2]`,
                    sessionActive && `overflow-y-hidden`
                )}
            >
                <div
                    className={cn(
                        `flex flex-col`,
                        sessionActive && `pt-4 gap-4`
                    )}
                >
                    <React.Fragment>
                        {
                            userTaskTodoStateIsLoading &&
                            Array.from({ length : 8 }).map( _ => (
                                <Skeleton
                                    className="w-full max-w-[30rem] mb-[1rem] h-[13rem]"
                                />
                            ) )
                        }
                        {
                            userTaskTodoState &&
                            userTaskTodoState.length === 0 &&
                            <TaskCardDrop
                                noTodoMessage
                                displayOrder={0}
                            />
                        }
                        {
                            userTaskTodoState &&
                            <>
                                {
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
                                                        // fullSize={lastTask}
                                                    />
                                                }
                                            </React.Fragment>
                                        )

                                    } )
                                }
                                {
                                    (completedUseTaskTodoState.length > 0) &&
                                    <div
                                        className={cn(
                                            `flex flex-col gap-4 duration-500 opacity-0`,
                                            `transition-opacity duration-500 pointer-events-none`,
                                            !sessionActive && "opacity-100 pointer-events-auto"
                                        )}
                                    >
                                        <Separator/>
                                        <Label>Completed</Label>
                                        {
                                            completedUseTaskTodoState.map( task => (
                                                <TaskCard
                                                    key={task.task_id}
                                                    data={task}
                                                />
                                            ) )
                                        }
                                    </div>
                                }
                            </>
                        }
                    </React.Fragment>
                </div>
            </div>
            <div className="relative mx-4 h-[3.5rem] flex gap-2 items-center p-4 pt-0 mt-8" >
                <Button
                    variant={"outline"}
                    size={"lg"}
                    className={cn(
                        `absolute left-0 top-0`,
                        "w-[calc(50%-0.5rem)] rounded-lg transition-all duration-500 delay-500",
                        sessionActive && `translate-y-full opacity-0 delay-0`
                    )}
                    onClick={() => setAvailableTasksDrawerOpen(true)}
                    ><Plus/> Add Task</Button>
                <Button
                    // variant={ sessionActive ? "outline" : "default"}
                    variant={"outline"}
                    size={"lg"}
                    className={cn(
                        `absolute top-0 right-0`,
                        "w-[calc(50%-0.5rem)] rounded-lg transition-all duration-500 delay-250",
                        sessionActive && `w-full !border-green-300`
                    )}
                    onClick={switchToFocusModeFromOverlayMode}
                    >
                        <div
                            className={cn(
                                `absolute top-0 left-0 size-full rounded-lg`,
                                `bg-gradient-to-t from-green-300/20 to-green-300/0`,
                                `opacity-0 transition-opacity duration-500 delay-250`,
                                sessionActive && `opacity-100`
                            )}
                        ></div>
                        <Eye/> Focus Mode
                </Button>
            </div>
        </div>
    )

}

export default TodoList_TaskTodoPageOverlay;