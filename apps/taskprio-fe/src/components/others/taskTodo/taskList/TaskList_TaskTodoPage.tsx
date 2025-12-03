import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";

import { PauseIcon, PlayIcon } from "lucide-react";
import React, { useContext, useMemo, useState } from "react";
import { 
    useTaskTodoPageStore_sessionActive,
    useTaskTodoPageStore_totalCurrentWorkTimeString,
    useTaskTodoPageStore_timerCount, 
    useTaskTodoPageStore_userTaskTodoStateIsLoading,
    useTaskTodoPageStore_totalCurrentWorkTimeNumber,
    useTaskTodoPageStore_totalWorkTimeGoalNumber
} from "@/stores/taskTodoPage";
import { StateManager_TaskTodoPageContext } from "../StateManager_TaskTodoPage";
import TaskTodoFinishSessionDialog from "../../dialogs/TaskTodoFinishSessionDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskCard from "./TaskCard_TaskTodoPage";
import TaskCardDrop from "./TaskCardDrop_TaskTodoPage";
import { Skeleton } from "@/components/ui/skeleton";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

const TaskList_TaskTodoPage = () => {

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

    const sortedUserTaskTodoState = useMemo(() => {
        return [...(userTaskTodoState || [])!].sort( ( a, b ) => b.display_order - a.display_order )
    }, [userTaskTodoState])

    const handleSessionButtonOnClick = async () => {
        setLoading(true)
        if ( sessionActive ) {
            await handlePauseSession()
        } else {
            await handleStartSession()
        }
        setLoading(false)
    }

    return (
        <div
            className={cn(
                ` relative w-full max-w-[40rem] min-w-[40rem] min-h-0 h-full `,
                ` flex flex-col grow `,
                !taskTodoPageShowAvailableTasks && ` max-w-full `
            )}
        >
            <TaskTodoFinishSessionDialog
                open={finishSessionDialogOpen}
                onOpenChange={setFinishSessionDialogOpen}
            />

            <div
                className={cn(
                    ` px-[2rem] pt-[2rem] min-h-0 `
                )}
            >
                <div
                    className={cn(
                        ` relative `,
                        ` w-full h-full min-h-0 `,
                        ` grid grow `,
                    )}
                    style={{
                        gridTemplateRows : "min-content 1fr"
                    }}
                >
                    <div
                        className={cn(
                            ` flex flex-col justify-between `,
                            ` w-full max-w-[30rem] h-fit min-h-0 m-4 mx-auto p-4 pt-[4rem] `,
                        )}
                    >
                        <div
                            className=" flex items-center gap-4 "
                        >
                            <Tooltip>
                                <TooltipTrigger asChild >
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
                                    {/* <p className=" flex gap-4 text-3xl font-bold " ><span>{ totalCurrentWorkTimeString }</span></p> */}
                                </TooltipTrigger>
                                <TooltipContent>Current work time</TooltipContent>
                            </Tooltip>
                            <span className="text-5xl font-bold" >/</span>
                            <Tooltip>
                                <TooltipTrigger asChild >
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
                                    {/* <p className=" flex gap-4 text-3xl " ><span>{ totalWorkTimeGoalString }</span></p> */}
                                </TooltipTrigger>
                                <TooltipContent>Work time goal</TooltipContent>
                            </Tooltip>
                        </div>
                        <div
                            className=" w-full h-fit py-[1rem] "
                        >
                            <div
                                className=" flex gap-4 h-fit "
                            >
                                <Button
                                    size={"icon"}
                                    variant={sessionActive ? "destructive" : "secondary"}
                                    isLoading={loading}
                                    disabled={userTaskTodoStateIsLoading}
                                    spinnerSize="xl"
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
                                        sessionActive &&
                                        <div className="absolute top-0 left-0 size-full rounded-full bg-destructive/50 animate-ping" ></div>
                                    }
                                    { sessionActive ? <PauseIcon className=" size-[50%] " /> : <PlayIcon className=" size-[50%] " /> }   
                                </Button>
                                {
                                    !sessionActive &&
                                    <div>
                                        <Button
                                            variant={"secondary"}
                                            onClick={() => setFinishSessionDialogOpen(true)}
                                            disabled={userTaskTodoStateIsLoading}
                                        >Finish Session</Button>
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