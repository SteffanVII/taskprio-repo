import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";

import { Eye, Minimize2, Moon, PauseIcon, PlayIcon } from "lucide-react";
import React, { useContext, useMemo, useRef, useState } from "react";
import { 
    useTaskTodoPageStore_sessionActive,
    useTaskTodoPageStore_timerCount, 
    useTaskTodoPageStore_userTaskTodoStateIsLoading,
    useTaskTodoPageStore_totalCurrentWorkTimeNumber,
    useTaskTodoPageStore_totalWorkTimeGoalNumber,
    useTaskTodoPageStore_taskTodoPageCompactMode,
    updateTaskTodoPageStore,
} from "@/stores/taskTodoPage";
import TaskTodoFinishSessionDialog from "../../dialogs/TaskTodoFinishSessionDialog";
import TaskCard from "./TaskCard_TaskTodoPage";
import TaskCardDrop from "./TaskCardDrop_TaskTodoPage";
import { Skeleton } from "@/components/ui/skeleton";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Slider } from "@/components/ui/slider";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import Spinner from "../../Spinner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const TaskList_TaskTodoPage = () => {

    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()
    const userTaskTodoStateIsLoading = useTaskTodoPageStore_userTaskTodoStateIsLoading()
    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()

    const {
        handleStartSession,
        handlePauseSession,
        userTaskTodoState
    } = useContext(StateManager_TaskTodoPageContext)

    const {
        switchToOverlayModeFromFullMode,
        switchToFocusModeFromFullMode
    } = useContext(StateManager_ElectronContext)

    const sessionActive = useTaskTodoPageStore_sessionActive()
    const totalCurrentWorkTimeNumber = useTaskTodoPageStore_totalCurrentWorkTimeNumber()
    const totalWorkTimeGoalNumber = useTaskTodoPageStore_totalWorkTimeGoalNumber()
    const timerCount = useTaskTodoPageStore_timerCount()

    const taskListContainerRef = useRef<HTMLDivElement>(null)

    const [ finishSessionDialogOpen, setFinishSessionDialogOpen ] = useState(false)
    const [ loading, setLoading ] = useState<boolean>(false)

    const sortedUserTaskTodoState = useMemo(() => {
        const returnValue = [...(userTaskTodoState || [])!].filter( todo => !todo.completed ).sort( ( a, b ) => b.display_order - a.display_order )
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
                ` relative w-full max-w-[40rem] min-w-[40rem] min-h-0 h-full `,
                ` flex flex-col grow transition-transform duration-500 `,
                (!taskTodoPageShowAvailableTasks || taskTodoPageCompactMode) && ` max-w-full `,
                (taskTodoPageShowAvailableTasks && taskTodoPageCompactMode) && `-translate-x-full`
            )}
        >
            {/* <div
                className={cn(
                    "absolute z-[1] w-[20rem] h-[5rem] scale-50 top-[18rem] left-1/2 translate-x-[-50%] shadow-[0_3rem_14rem_0.7rem] shadow-primary bg-transparent",
                    `opacity-0 transition-all duration-[3000ms]`,
                    sessionActive && `opacity-100 scale-100`
                )}
            ></div> */}
            <TaskTodoFinishSessionDialog
                open={finishSessionDialogOpen}
                onOpenChange={setFinishSessionDialogOpen}
            />
            <div
                className={cn(
                    ` relative `,
                    ` w-full h-full min-h-0 `,
                    ` grid flex-col grow gap-4 `,
                )}
                style={{
                    gridTemplateRows : "min-content 1fr"
                }}
            >
                <div
                    className={cn(
                        ` flex flex-col justify-between `,
                        ` w-full max-w-[30rem] h-fit mx-auto pt-[3rem] z-[2] `,
                    )}
                >
                    <div
                        className=" flex items-center gap-4 "
                    >
                        <Tooltip>
                            <TooltipTrigger
                                render={
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
                                }
                            />
                            <TooltipContent>Current work time</TooltipContent>
                        </Tooltip>
                        <span className="text-5xl font-bold" >/</span>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <NumberFlowGroup>
                                        <div className="text-5xl font-bold" >
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
                                }
                            />
                            <TooltipContent>Work time goal</TooltipContent>
                        </Tooltip>
                    </div>
                    <div
                        className=" w-full h-fit "
                    >
                        <Slider
                            value={[totalCurrentWorkTimeNumber]}
                            max={totalWorkTimeGoalNumber}
                            step={1}
                            hideThumb
                        />
                        <div
                            className=" flex gap-2 h-fit pt-4 "
                        >
                            <Button
                                size={"icon"}
                                variant={sessionActive ? "destructive" : "default"}
                                disabled={userTaskTodoStateIsLoading || sortedUserTaskTodoState.length === 0 || loading}
                                className={cn(
                                    ` relative `,
                                    ` cursor-pointer `,
                                    ` transition-all `,
                                    ` hover:scale-110 hover:shadow-2xl `,
                                    ` active:scale-95 active:shadow-lg `,
                                    // !sessionActive && ` bg-green-500 hover:bg-green-600 `
                                )}
                                onClick={handleSessionButtonOnClick}
                            >
                                {
                                    (!loading && sessionActive) &&
                                    <div className="absolute top-0 left-0 size-full rounded-full bg-destructive/50 animate-ping" ></div>
                                }
                                { loading ? <Spinner/> : sessionActive ? <PauseIcon className=" size-[50%] " /> : <PlayIcon className=" size-[50%] " /> }   
                            </Button>
                            <Button
                                variant={"secondary"}
                                onClick={() => setFinishSessionDialogOpen(true)}
                                disabled={userTaskTodoStateIsLoading || sessionActive || (sortedUserTaskTodoState.length === 0 && userTaskTodoState?.length === 0)}
                            ><Moon/> Finish Session</Button>
                            <div className="flex items-center ml-auto gap-2" >
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Button
                                                size={"icon"}
                                                variant={"outline"}
                                                onClick={switchToFocusModeFromFullMode}
                                            >
                                                <Eye/>
                                            </Button>
                                        }
                                    />
                                    <TooltipContent>Focus Mode</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Button
                                                size={"icon"}
                                                variant={"outline"}
                                                onClick={switchToOverlayModeFromFullMode}
                                            >
                                                <Minimize2/>
                                            </Button>
                                        }
                                    />
                                    <TooltipContent>Overlay Mode</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    ref={taskListContainerRef}
                    className={cn(
                        "relative grow flex-col w-full h-full min-h-0 z-[2] overflow-y-auto",
                        sessionActive && `overflow-hidden`
                    )}
                >
                    <div
                        className={cn(
                            `grow flex flex-col`,
                            `!size-full max-w-[30rem] mx-auto min-h-0 p-4`,
                            sessionActive && `mt-4 gap-4`
                        )}
                    >
                        <React.Fragment>
                            {
                                userTaskTodoStateIsLoading &&
                                Array.from({ length : 8 }).map( (_, i) => (
                                    <Skeleton
                                        key={i}
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
                                                        // key={ taskIndex === 0 ? totalCurrentWorkTimeString + task.current_work_time : task.task_id + task.current_work_time}
                                                        key={ task.task_id }
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
                                                            fullSize={ completedUseTaskTodoState.length < 0 && lastTask}
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

            </div>
        </div>
    )

}

export default TaskList_TaskTodoPage;