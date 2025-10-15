import useTaskTodoPageStore from "@/stores/taskTodoPage";
import { useContext, useMemo } from "react";
import { StateManager_TaskTodoPageContext } from "../taskTodo/StateManager_TaskTodoPage";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter";
import TagBadge from "../shared/tag/TagBadge";
import { Slider } from "@/components/ui/slider";
import getHexLuminance from "@/lib/utils/hexColorLuminance";


const TodoCard_MainDashboardPane = () => {

    const { pathname } = useLocation()

    const {
        sessionActive,
        timerCount
    } =  useTaskTodoPageStore()

    const {
        topTaskTodo,
        userTaskTodoState,
        handleStartSession,
        handlePauseSession
    } = useContext(StateManager_TaskTodoPageContext)

    
    const workTimeExceeded = useMemo(() => {
        if ( !topTaskTodo ) return false
        return Number(topTaskTodo!.current_work_time) > Number(topTaskTodo!.work_time_goal)
    }, [topTaskTodo])
    
    const handleSessionButtonOnClick = () => {
        if ( sessionActive ) {
            handlePauseSession()
        } else {
            handleStartSession()
        }
    }
    
    if ( !userTaskTodoState || userTaskTodoState.length === 0 || pathname.includes("/tt") ) return null

    return (
        <div
            className={cn(
                `relative`,
                `flex flex-col gap-4`,
                `w-[calc(100%-1rem)] h-fit bg-accent `,
                `p-4 mx-auto`,
                `border rounded-lg shadow-t-lg `,
                `animate-in fade-in-0 duration-300 `,
                sessionActive && `shadow-2xl shadow-primary/40`
            )}
        >
            <div className="flex justify-between" >
                <div className="flex flex-col gap-2" >
                    <div className="flex gap-2" >
                        <Badge >Todo</Badge>
                        <Badge
                            className={cn(
                                getHexLuminance(topTaskTodo?.project_color || "#ffffff") > 0.4 ? `text-black` : `text-white`
                            )}
                            style={{
                                backgroundColor : topTaskTodo?.project_color === "#ffffff" ? undefined : topTaskTodo?.project_color
                            }}
                        >{topTaskTodo?.project_abbreviation.toUpperCase()}-{topTaskTodo?.task_depth}</Badge>
                    </div>
                    <p className="text-md font-semibold" >{topTaskTodo?.task_title}</p>
                </div>
                <Button
                    className={cn(
                        "relative ml-auto",
                        `transition-all `,
                        `hover:scale-110 hover:shadow-2xl `,
                        `active:scale-95 active:shadow-lg `,
                    )}
                    size="icon"
                    variant={sessionActive ? "destructive" : "default"}
                    onClick={handleSessionButtonOnClick}
                >
                    {
                        sessionActive &&
                        <div
                            className="absolute top-0 left-0 size-full rounded-full bg-destructive/50 animate-ping delay-500"
                        ></div>
                    }
                    {
                        sessionActive ?
                        <PauseIcon/>
                        :
                        <PlayIcon/>
                    }
                </Button>
            </div>
            <div className="flex flex-col gap-2" >
                <p
                    className={cn(
                        workTimeExceeded && "text-destructive"
                    )}
                >
                    {formatTaskTodoTimeSeconds(Number(topTaskTodo?.current_work_time) + timerCount)} / {formatTaskTodoTimeSeconds(Number(topTaskTodo?.work_time_goal))}
                </p>
            </div>
            <Slider
                value={[Number(topTaskTodo!.current_work_time)]}
                min={0}
                max={Number(topTaskTodo!.work_time_goal)}
                step={1}
            />
            {
                topTaskTodo!.tags.length > 0 && (
                    <div
                        className={cn(
                            ` flex flex-wrap gap-1 overflow-hidden rounded-bl-[0.3rem] `,
                        )}
                    >
                        {
                            topTaskTodo!.tags.map( tag => (
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

}

export default TodoCard_MainDashboardPane;