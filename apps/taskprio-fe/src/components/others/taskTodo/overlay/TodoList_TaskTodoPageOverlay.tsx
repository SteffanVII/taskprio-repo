import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGlobalsStore_selectedWorkspace, useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { updateTaskTodoPageStore, useTaskTodoPageStore_sessionActive, useTaskTodoPageStore_taskTodoPageCompactMode, useTaskTodoPageStore_timerCount, useTaskTodoPageStore_totalCurrentWorkTimeNumber, useTaskTodoPageStore_totalCurrentWorkTimeString, useTaskTodoPageStore_totalWorkTimeGoalNumber, useTaskTodoPageStore_userTaskTodoStateIsLoading } from "@/stores/taskTodoPage";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Moon, Pause, Play, Plus } from "lucide-react";
import React, { useContext, useMemo, useRef, useState } from "react";
import TaskCardDrop from "../taskList/TaskCardDrop_TaskTodoPage";
import { useNavigate } from "react-router";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTodoFinishSessionDialog from "../../dialogs/TaskTodoFinishSessionDialog";
import TaskCard from "./TaskCard_TodoList_TaskTodoPageOverlay";

const TodoList_TaskTodoPageOverlay = () => {

    const navigate = useNavigate()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()
    const userTaskTodoStateIsLoading = useTaskTodoPageStore_userTaskTodoStateIsLoading()
    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()

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

    return (
        <div
            className={cn(
                `grid`,
                `min-h-full`,
                `gap-4`
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
                    `flex flex-col gap-4`
                )}
            >
                {/* Timer */}
                <div
                    className={cn(
                        `flex items-center justify-between gap-4`,
                        `px-4 mx-4`,
                        `rounded-2xl border border-primary`
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
                <div className="flex items-center gap-4 px-8" >
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
                <div className="flex items-center px-4" >
                    <Button
                        variant={"ghost"}
                    ><Plus/> Add Task</Button>
                </div>
            </div>
            <div
                ref={taskListContainerRef}
                className={cn(
                    `flex flex-col`,
                    `min-h-0 h-full max-h-full overflow-y-auto`,
                    `mx-4`,
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
        </div>
    )

}

export default TodoList_TaskTodoPageOverlay;