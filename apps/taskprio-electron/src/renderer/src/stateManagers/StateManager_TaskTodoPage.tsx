import dayjs from "@/lib/dayjs"
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter"
import { useStartOrStopTaskTodoTimer } from "@/services/private/todo/mutation"
import { useGetUserTaskTodoState } from "@/services/private/todo/query"
import {
  useTaskTodoPageStore,
  useTaskTodoPageStore_timerCount
} from "@/stores/taskTodoPage"
import { EWebsocketClientEventType, TGetUserTaskTodoStateResponseData, TUserTaskTodoState } from "@repo/taskprio-types"
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useParams } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { QueryKeys } from "@/services/enum"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { taskTodoTimerHeartbeatEventHandler } from "@/components/others/websocket/eventHandlers/outgoing/taskTodoEventHandlers"

type TStateManager_TaskTodoPageContext = {
  handleStartSession: () => Promise<void>,
  handlePauseSession: () => Promise<void>,
  invalidateUseGetUserTaskTodoState: () => void,
  userTaskTodoState: TGetUserTaskTodoStateResponseData | undefined,
  topTaskTodo: TUserTaskTodoState | null
}

export const StateManager_TaskTodoPageContext = createContext<TStateManager_TaskTodoPageContext>({
  handleStartSession: () => Promise.resolve(),
  handlePauseSession: () => Promise.resolve(),
  invalidateUseGetUserTaskTodoState: () => { },
  userTaskTodoState: undefined,
  topTaskTodo: null
})

type TStateManager_TaskTodoPage = {
  children: React.ReactNode
}

const StateManager_TaskTodoPage: React.FC<TStateManager_TaskTodoPage> = ({
  children
}) => {

  const queryClient = useQueryClient()

  const { workspace_id } = useParams({ strict : false })

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const timerCount = useTaskTodoPageStore_timerCount()
  const setSessionActive = useTaskTodoPageStore(state => state.setSessionActive)
  const setTimerCount = useTaskTodoPageStore(state => state.setTimerCount)
  const setTotalCurrentWorkTimeString = useTaskTodoPageStore(state => state.setTotalCurrentWorkTimeString)
  const setTotalWorkTimeGoalString = useTaskTodoPageStore(state => state.setTotalWorkTimeGoalString)
  const setTotalCurrentWorkTimeNumber = useTaskTodoPageStore(state => state.setTotalCurrentWorkTimeNumber)
  const setTotalWorkTimeGoalNumber = useTaskTodoPageStore(state => state.setTotalWorkTimeGoalNumber)

  const {
    sendWebSocketMessage
  } = useContext(WebSocketContext)

  const {
    data: userTaskTodoState,
    isFetching: userTaskTodoStateIsFetching
  } = useGetUserTaskTodoState(
    {
      pathParameter: {
        workspace_id: selectedWorkspace?.workspace_id
      }
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  const {
    mutateAsync: startOrStopTaskTodoStateTrigger
  } = useStartOrStopTaskTodoTimer()

  const timerWorkerRef = useRef<Worker | null>(null)

  const topTaskTodo = useMemo<TUserTaskTodoState | null>(() => {
    if (userTaskTodoState && userTaskTodoState.length > 0) {
      const arr = [...userTaskTodoState!].filter(taskTodo => !taskTodo.completed).sort((a, b) => b.display_order - a.display_order)
      if (arr.length === 0) return null
      const returnValue = { ...arr[0] }
      if (returnValue) {
        returnValue.current_work_time = (Number(returnValue.current_work_time) + timerCount).toString()
      }
      return returnValue
    } else {
      return null
    }
  }, [userTaskTodoState])

  const handleStartSession = async () => {
    if (topTaskTodo) {
      await startOrStopTaskTodoStateTrigger({
        pathParameters: {
          task_id: topTaskTodo.task_id
        }
      })
    }
  }

  const handlePauseSession = async () => {
    if (timerWorkerRef.current) {
      timerWorkerRef.current.onmessage = null
      timerWorkerRef.current.terminate()
      timerWorkerRef.current = null
    }
    if (topTaskTodo) {
      await startOrStopTaskTodoStateTrigger({
        pathParameters: {
          task_id: topTaskTodo.task_id
        }
      })

    }
    setSessionActive(false)
    setTimerCount(0)
  }

  const invalidateUseGetUserTaskTodoState = () => {
    // queryClient.invalidateQueries({
    //     queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkpace?.workspace_id ],
    // })
    queryClient.removeQueries({
      queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
    })
    // queryClient.cancelQueries({
    //     queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkpace?.workspace_id ]
    // })
  }

  useEffect(() => {
    if (userTaskTodoState) {
      // Calculate total time from start and stop data of timers inside each of the task todo state
      const totalCurrentWorkTime = userTaskTodoState.reduce((acc, curr) => {
        const totalTimers = curr.timers.reduce((acc2, curr2) => {
          if (curr2.start && curr2.stop) {
            const start = dayjs(curr2.start)
            const stop = dayjs(curr2.stop)
            return acc2 + stop.diff(start, "second")
          }
          return acc2
        }, 0)
        return acc + totalTimers
      }, 0) + timerCount

      const totalWorkTimeGoal = userTaskTodoState.reduce((acc, curr) => acc + Number(curr.work_time_goal), 0)
      setTotalCurrentWorkTimeString(formatTaskTodoTimeSeconds(totalCurrentWorkTime))
      setTotalWorkTimeGoalString(formatTaskTodoTimeSeconds(totalWorkTimeGoal))
      setTotalCurrentWorkTimeNumber(totalCurrentWorkTime)
      setTotalWorkTimeGoalNumber(totalWorkTimeGoal)
    } else {
      setTotalCurrentWorkTimeString("0m")
      setTotalWorkTimeGoalString("0m")
      setTotalCurrentWorkTimeNumber(0)
      setTotalWorkTimeGoalNumber(0)
    }
  }, [userTaskTodoState, timerCount])

  useLayoutEffect(() => {
    // Start timer if top todo has active timer
    if (
      !!topTaskTodo &&
      !!topTaskTodo.timers[0] &&
      topTaskTodo.timers[0].stop === null &&
      workspace_id === topTaskTodo.timers[0].workspace_id &&
      !userTaskTodoStateIsFetching
    ) {
      if (timerWorkerRef.current === null) {
        setSessionActive(true)
        const start = dayjs.utc(topTaskTodo.timers[0].start)
        const timeDiff = dayjs.utc().diff(start, "second")
        timerWorkerRef.current = new Worker(new URL("./timerWorker.js", import.meta.url))
        timerWorkerRef.current!.onmessage = (e: MessageEvent) => {
          if (e.data === 0) {
            setTimerCount(Math.max(0, timeDiff) + 0)
          } else {
            // Send heartbeat every 60 seconds
            if ((e.data + 1) % 60 === 0) {
              taskTodoTimerHeartbeatEventHandler({
                type: EWebsocketClientEventType.TASK_TODO_TIMER_HEARTBEAT,
                message: {
                  task_id: topTaskTodo.task_id,
                  workspace_id: selectedWorkspace?.workspace_id!
                }
              }, sendWebSocketMessage)
            }
            setTimerCount(Math.max(0, timeDiff) + e.data)
          }
        }
      }
    } else {
      if (timerWorkerRef.current) {
        timerWorkerRef.current.onmessage = null
        timerWorkerRef.current.terminate()
        timerWorkerRef.current = null
        setSessionActive(false)
        setTimerCount(0)
      }
    }
  }, [
    topTaskTodo,
    userTaskTodoStateIsFetching,
    workspace_id
  ])

  useEffect(() => {
    return () => {
      if (timerWorkerRef.current) {
        timerWorkerRef.current.terminate()
      }
    }
  }, [])

  return (
    <StateManager_TaskTodoPageContext.Provider
      value={{
        handleStartSession,
        handlePauseSession,
        invalidateUseGetUserTaskTodoState,
        userTaskTodoState,
        topTaskTodo
      }}
    >
      {children}
    </StateManager_TaskTodoPageContext.Provider>
  )

}

export default StateManager_TaskTodoPage;