import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGlobalsStore_selectedWorkspace, useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { ETaskTodoPageUIMode, updateTaskTodoPageStore, useTaskTodoPageStore_sessionActive, useTaskTodoPageStore_taskTodoPageCompactMode, useTaskTodoPageStore_timerCount, useTaskTodoPageStore_totalCurrentWorkTimeNumber, useTaskTodoPageStore_totalCurrentWorkTimeString, useTaskTodoPageStore_totalWorkTimeGoalNumber, useTaskTodoPageStore_userTaskTodoStateIsLoading } from "@/stores/taskTodoPage";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Eye, Moon, Pause, Play, Plus } from "lucide-react";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import TaskCardDrop from "../taskList/TaskCardDrop_TaskTodoPage";
import { useNavigate } from "react-router";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTodoFinishSessionDialog from "../../dialogs/TaskTodoFinishSessionDialog";
import TaskCard from "./TaskCard_TodoList_TaskTodoPageOverlay";
import AvailableTasksDrawer_TaskTodoPageOverlay from "./AvailableTasksDrawer_TaskTodoPageOverlay";

const TodoList_TaskTodoPageOverlay = () => {

    const navigate = useNavigate()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()
    const userTaskTodoStateIsLoading = useTaskTodoPageStore_userTaskTodoStateIsLoading()

    const {
        handleStartSession,
        handlePauseSession,
        userTaskTodoState
    } = useContext(StateManager_TaskTodoPageContext)

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
        const returnValue = [...(userTaskTodoState || [])!].sort( ( a, b ) => b.display_order - a.display_order )
        updateTaskTodoPageStore({
            topTaskTodo : returnValue[0] ?? null
        })
        return returnValue
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

    const handleFocusModeOnClick = () => {
        if ( !!window.electronAPI ) {
            updateTaskTodoPageStore({
                uIMode : ETaskTodoPageUIMode.WIDGET
            })
            window.electronAPI.makeWindowToFocusMode()
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
                    `bg-gradient-to-t from-card to-card/0`,
                    `border`,
                    `mx-4 mt-4 rounded-3xl transition-colors duration-500`,
                    sessionActive && `border-destructive/50 from-destructive/20`
                )}
            >
                {/* Timer */}
                <div
                    className={cn(
                        `flex items-center justify-between gap-4`,
                        `mx-4`,
                        `rounded-2xl`,
                        sessionActive && `shadow-2xl`
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
                            <TooltipTrigger asChild >
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
                            </TooltipTrigger>
                            <TooltipContent>End Session</TooltipContent>
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
                    `mx-4 mt-4`,
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
                    </React.Fragment>
                </div>
            </div>
            <div className="relative mx-4 h-[3.5rem] flex gap-2 items-center p-4 pt-0 mt-8" >
                <Button
                    variant={"outline"}
                    size={"lg"}
                    className={cn(
                        `absolute left-0 top-0`,
                        "w-[calc(50%-0.5rem)] rounded-full transition-all duration-500 delay-500",
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
                        "w-[calc(50%-0.5rem)] rounded-full transition-all duration-500 delay-250",
                        sessionActive && `w-full !border-green-300`
                    )}
                    onClick={handleFocusModeOnClick}
                    >
                        <div
                            className={cn(
                                `absolute top-0 left-0 size-full rounded-full`,
                                `bg-gradient-to-t from-green-300/20 to-green-300/0`,
                                `opacity-0 transition-opacity duration-500 delay-250`,
                                sessionActive && `opacity-100`
                            )}
                        ></div>
                        <Eye/> Focus Mode
                    </Button>
                {/* <Button
                    variant={"outline"}
                    size={"lg"}
                    className="grow rounded-full"
                    onClick={() => setAvailableTasksDrawerOpen(true)}
                ><Moon/> End Session</Button> */}
            </div>
        </div>
    )

}

export default TodoList_TaskTodoPageOverlay;