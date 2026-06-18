import {
  useTaskTodoPageStore_sessionActive,
  useTaskTodoPageStore_timerCount
} from "@/stores/taskTodoPage";
import { useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Eye, Minimize2, PauseIcon, PlayIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TagBadge from "../shared/tag/TagBadge";
import { Slider } from "@/components/ui/slider";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { TUserTaskTodoState } from "@repo/taskprio-types";
import dayjs from "@/lib/dayjs";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { StateManager_TaskTodoPageContext } from "@/stateManagers/StateManager_TaskTodoPage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import Spinner from "../Spinner";


const TodoCard_MainDashboardPane = () => {

  const { pathname } = useLocation()

  const sessionActive = useTaskTodoPageStore_sessionActive()
  const timerCount = useTaskTodoPageStore_timerCount()

  const {
    topTaskTodo,
    userTaskTodoState,
    handleStartSession,
    handlePauseSession
  } = useContext(StateManager_TaskTodoPageContext)

  const {
    switchToOverlayModeFromFullMode,
    switchToFocusModeFromFullMode
  } = useContext(StateManager_ElectronContext)

  const [loading, setLoading] = useState<boolean>(false)

  const currentWorkTime = (value: TUserTaskTodoState | null) => {
    if (value) {
      return (value.timers || []).reduce((acc, curr) => {
        if (curr.start && curr.stop) {
          const start = dayjs(curr.start)
          const stop = dayjs(curr.stop)
          return acc + stop.diff(start, "second")
        }
        return acc
      }, 0)
    }
    return 0
  }

  const workTimeExceeded = useMemo(() => {
    if (!topTaskTodo) return false
    return Math.floor((currentWorkTime(topTaskTodo) + timerCount)) > Number(topTaskTodo!.work_time_goal)
  }, [topTaskTodo])

  const handleSessionButtonOnClick = async () => {
    setLoading(true)
    if (sessionActive) {
      await handlePauseSession()
    } else {
      await handleStartSession()
    }
    setLoading(false)
  }

  if (!userTaskTodoState || userTaskTodoState.length === 0 || topTaskTodo === null || pathname.includes("/tt")) return null

  return (
    <div
      className={cn(
        `relative`,
        `flex flex-col gap-4`,
        `w-[calc(100%-1rem)] h-fit `,
        `p-4 mx-auto bg-card`,
        `border border-border rounded-lg shadow-t-lg `,
        `bg-gradient-to-t from-secondary/50 to-transparent `,
        `animate-in fade-in-0 duration-300 `,
      )}
    >
      <div
        className={cn(
          `absolute bottom-full left-0 w-full`,
          `flex justify-between items-end py-4`,
          `opacity-0 transition-opacity duration-200 group-hover:opacity-100`
        )}
      >
        <Badge variant={"outline"} className="rounded-md" >Todo</Badge>

        <div className="flex gap-2" >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={"outline"}
                  size={"icon-sm"}
                  onClick={switchToFocusModeFromFullMode}
                ><Eye /></Button>
              }
            />
            <TooltipContent>Focus Mode</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={"outline"}
                  size={"icon-sm"}
                  onClick={switchToOverlayModeFromFullMode}
                ><Minimize2 /></Button>
              }
            />
            <TooltipContent>Overlay Mode</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        className={cn(
          `absolute top-0 left-0 size-full rounded-lg duration-[1500ms]`,
          sessionActive && `shadow-[0_3rem_14rem_0.7rem]  shadow-primary/40`
        )}
      ></div>
      <div className="flex justify-between" >
        <div className="flex flex-col gap-2" >
          <div className="flex gap-2" >
            <Badge
              className={cn(
                getHexLuminance(topTaskTodo?.project_color || "#ffffff") > 0.4 ? `text-black` : `text-white`
              )}
              style={{
                backgroundColor: topTaskTodo?.project_color === "#ffffff" ? undefined : topTaskTodo?.project_color
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
          disabled={loading}
        >
          {
            (!loading && sessionActive) &&
            <div
              className="absolute top-0 left-0 size-full rounded-full bg-destructive/50 animate-ping"
            ></div>
          }
          {
            loading ?
              <Spinner />
              :
              sessionActive ?
                <PauseIcon />
                :
                <PlayIcon />
          }
        </Button>
      </div>
      <div className="flex gap-2" >
        <p
          className={cn(
            workTimeExceeded && "text-destructive truncate"
          )}
        >
          <NumberFlowGroup>
            <span
              className={cn(
                "text-3xl font-bold",
              )}
            >
              <NumberFlow
                value={Math.floor((currentWorkTime(topTaskTodo) + timerCount) / 3600)}
              />
              <NumberFlow
                prefix=":"
                value={Math.floor(((currentWorkTime(topTaskTodo) + timerCount) % 3600) / 60)}
                digits={{ 1: { max: 5 } }}
                format={{ minimumIntegerDigits: 2 }}
              />
              <NumberFlow
                prefix=":"
                value={(currentWorkTime(topTaskTodo) + timerCount) % 60}
                digits={{ 1: { max: 5 } }}
                format={{ minimumIntegerDigits: 2 }}
              />
            </span>
          </NumberFlowGroup>
          <span className="text-3xl font-bold" >/</span>
          <NumberFlowGroup>
            <span className="text-2xl font-bold" >
              <NumberFlow
                value={Math.floor(Number(topTaskTodo?.work_time_goal) / 3600)}
              />
              <NumberFlow
                prefix=":"
                value={Math.floor((Number(topTaskTodo?.work_time_goal) % 3600) / 60)}
                digits={{ 1: { max: 5 } }}
                format={{ minimumIntegerDigits: 2 }}
              />
            </span>
          </NumberFlowGroup>
        </p>
      </div>
      <Slider
        value={[currentWorkTime(topTaskTodo) + timerCount]}
        min={0}
        max={Number(topTaskTodo!.work_time_goal)}
        step={1}
        className={cn(
          (currentWorkTime(topTaskTodo) + timerCount) > Number(topTaskTodo!.work_time_goal) && `text-destructive`
        )}
      />
      {
        topTaskTodo!.tags.length > 0 && (
          <div
            className={cn(
              ` flex flex-wrap gap-1 `,
            )}
          >
            {
              topTaskTodo!.tags.map(tag => (
                <TagBadge
                  tag={tag}
                  key={tag.tag_id}
                  size="sm"
                />
              ))
            }
          </div>
        )
      }
    </div>
  )

}

export default TodoCard_MainDashboardPane;