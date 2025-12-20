import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage"
import { ETaskTodoPageUIMode, updateTaskTodoPageStore, useTaskTodoPageStore_sessionActive, useTaskTodoPageStore_timerCount } from "@/stores/taskTodoPage"
import NumberFlow, { NumberFlowGroup } from "@number-flow/react"
import { TUserTaskTodoState } from "@repo/taskprio-types/src"
import { Maximize2, PauseIcon, PlayIcon } from "lucide-react"
import { useContext, useMemo } from "react"

const FocusMode_TaskTodoPageOverlay = () => {

    const sessionActive = useTaskTodoPageStore_sessionActive()
    const timerCount = useTaskTodoPageStore_timerCount()

    const {
        topTaskTodo,
        userTaskTodoState,
        handleStartSession,
        handlePauseSession
    } = useContext(StateManager_TaskTodoPageContext)

    const totalWorkTime = useMemo(() => {
        if ( topTaskTodo )
        if ( topTaskTodo.timers && topTaskTodo.timers.length > 0 ) {
            const total = topTaskTodo.timers.reduce( (accu, curr) => {
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
    }, [topTaskTodo])

    const handleSessionButtonOnClick = async () => {
        if ( sessionActive ) {
            await handlePauseSession()
        } else {
            await handleStartSession()
        }
    }

    const handleMaximizeOnClick = () => {
        if ( !!window.electronAPI ) {
            window.electronAPI.makeWindowToTaskTodoOverlayMode()
            updateTaskTodoPageStore({
                uIMode : ETaskTodoPageUIMode.OVERLAY
            })
        }
    }

    return (
        <>
            <div
                className={cn(
                    `absolute top-[1.2rem] right-4 z-10`,
                    `flex items-center gap-2 p-2 px-3 rounded-full`,
                    `bg-muted text-muted-foreground border border-border`,
                    `opacity-0 transition-opacity duration-200`,
                    `group-hover:opacity-100`,
                )}
            >
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            variant={"ghost"}
                            size={"icon-xs"}
                            onClick={handleMaximizeOnClick}
                        >
                            <Maximize2 className="size-[0.8rem]" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Maximize</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild >
                        <Button
                            variant={ sessionActive ? "destructive" : "ghost"}
                            size={"icon-xs"}
                            onClick={handleSessionButtonOnClick}
                        >
                            {
                                sessionActive ? <PauseIcon className="size-[0.9rem]" /> : <PlayIcon className="size-[0.9rem]" />
                            }
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {
                            sessionActive ? "Pause" : "Start"
                        }
                    </TooltipContent>
                </Tooltip>
            </div>
            <div
                className={cn(
                    `relative w-full h-[1rem]`,
                    `electron-focus-mode-drag-area`,
                )}
            >
                <div
                    className={cn(
                        `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`,
                        `w-[80%] h-[30%]`,
                        `bg-accent rounded-full`,
                    )}
                ></div>
            </div>

            <div
                className={cn(
                    `h-full`,
                    `flex flex-col`,
                    `p-4 pt-0`
                )}
            >
                <div
                    className={cn(
                        `flex items-center justify-between`
                    )}
                >
                    <div className="flex items-center gap-2" >
                        <NumberFlowGroup>
                            <span
                                className={cn(
                                    "text-3xl font-bold",
                                )}
                            >
                                <NumberFlow
                                    value={ Math.floor( (totalWorkTime + timerCount) / 3600 ) }
                                />
                                <NumberFlow
                                    prefix=":"
                                    value={Math.floor(((totalWorkTime + timerCount) % 3600) / 60)}
                                    digits={{ 1: { max: 5 } }}
                                    format={{ minimumIntegerDigits: 2 }}
                                    />
                                <NumberFlow
                                    prefix=":"
                                    value={(totalWorkTime + timerCount) % 60}
                                    digits={{ 1: { max: 5 } }}
                                    format={{ minimumIntegerDigits: 2 }}
                                />
                            </span>
                        </NumberFlowGroup>
                        <span className="text-3xl font-bold" >/</span>
                        <NumberFlowGroup>
                            <span className="text-muted-foreground text-2xl font-bold" >
                                <NumberFlow
                                    value={ Math.floor( Number(topTaskTodo?.work_time_goal) / 3600 ) }
                                />
                                <NumberFlow
                                    prefix=":"
                                    value={Math.floor((Number(topTaskTodo?.work_time_goal) % 3600) / 60)}
                                    digits={{ 1: { max: 5 } }}
                                    format={{ minimumIntegerDigits: 2 }}
                                    />
                            </span>
                        </NumberFlowGroup>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2" >
                    {
                        topTaskTodo &&
                        <p
                            className={cn(
                                `w-fit px-2 py-1 rounded bg-primary text-xs text-primary-foreground font-semibold`,
                                getHexLuminance(topTaskTodo.project_color) > 0.4 ? `text-black` : `text-white`
                            )}
                            style={{
                                backgroundColor : topTaskTodo.project_color === "#ffffff" ? undefined : topTaskTodo.project_color
                            }}
                        >{topTaskTodo.project_abbreviation.toUpperCase()}-{topTaskTodo.task_depth}</p>
                    }
                    <p
                        className={cn(
                            `max-w-[14rem] text-[0.9rem] text-nowrap overflow-hidden text-ellipsis`
                        )}
                        title={topTaskTodo?.task_title}
                    >{topTaskTodo?.task_title}</p>
                </div>
                <Progress
                    value={totalWorkTime + (timerCount??0)}
                    max={Number(topTaskTodo?.work_time_goal)}
                    className="mt-[0.6rem]"
                />
            </div>
        </>
    )

}

export default FocusMode_TaskTodoPageOverlay