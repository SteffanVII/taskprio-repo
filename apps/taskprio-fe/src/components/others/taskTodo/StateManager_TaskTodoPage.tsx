import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter"
import { QueryKeys } from "@/services/enum"
import { useUpdateTaskTodoState } from "@/services/private/todo/mutation"
import { useGetUserTaskTodoState } from "@/services/private/todo/query"
import useTaskTodoPageStore, { updateTaskTodoPageStore } from "@/stores/taskTodoPage"
import { TGetUserTaskTodoStateResponseData, TUserTaskTodoState } from "@repo/taskprio-types/src"
import { useQueryClient } from "@tanstack/react-query"
import { produce } from "immer"
import React, { createContext, useCallback, useEffect, useMemo, useRef } from "react"
import { useParams } from "react-router"

type TStateManager_TaskTodoPageContext = {
    handleStartSession : () => void,
    handlePauseSession : () => void,
    userTaskTodoState : TGetUserTaskTodoStateResponseData | undefined,
    topTaskTodo : TUserTaskTodoState | null
}

export const StateManager_TaskTodoPageContext = createContext<TStateManager_TaskTodoPageContext>({
    handleStartSession : () => {},
    handlePauseSession : () => {},
    userTaskTodoState : undefined,
    topTaskTodo : null
})

type TStateManager_TaskTodoPage = {
    children : React.ReactNode
}

const StateManager_TaskTodoPage : React.FC<TStateManager_TaskTodoPage> = ({
    children
}) => {

    const queryClient = useQueryClient()

    const { workspace_id } = useParams()

    const {
        timerCount
    } = useTaskTodoPageStore()

    const {
        data : userTaskTodoState
    } = useGetUserTaskTodoState(
        {
            pathParameter : {
                workspace_id
            }
        },
        {
            refetchOnWindowFocus : false,
        }
    )

    const {
        mutateAsync : updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState( undefined, [ QueryKeys.GET_USER_TASK_TODO_STATE.value ] )

    const timerWorkerRef = useRef<Worker | null>(null)

    const topTaskTodo = useMemo<TUserTaskTodoState | null>(() => {
        if ( userTaskTodoState && userTaskTodoState.length > 0 ) {
            const returnValue = {...[...userTaskTodoState!].sort( ( a, b ) => b.display_order - a.display_order )[0]!}
            if ( returnValue ) {
                returnValue.current_work_time = ( Number(returnValue.current_work_time) + timerCount ).toString()
            }
            return returnValue
        } else {
            return null
        }
    }, [ userTaskTodoState ])

    const handleStartSession = () => {

        updateTaskTodoPageStore({
            sessionActive : true
        })

        setTimeout(() => {
            timerWorkerRef.current = new Worker(new URL("./timerWorker.js", import.meta.url))
            timerWorkerRef.current!.onmessage = ( e : MessageEvent ) => {
                if ( e.data === 0 ) {
                    updateTaskTodoStateTrigger({
                        pathParameters : {
                            task_id : topTaskTodo!.task_id
                        },
                        body : {
                            current_work_time : ( Number(topTaskTodo!.current_work_time) + 60 )
                        }
                    })
                    queryClient.setQueryData(
                        [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ],
                        ( oldData : TGetUserTaskTodoStateResponseData ) => produce( oldData, draft => {
                            if ( draft.length > 0 ) {
                                draft.sort( ( a, b ) => b.display_order - a.display_order )
                                draft[0].current_work_time = ( Number(draft[0].current_work_time) + 60 ).toString()
                            }
                        } )
                    )
                    updateTaskTodoPageStore({
                        timerCount : 0
                    })
                } else {
                    updateTaskTodoPageStore({
                        timerCount : e.data
                    })
                }
            }
        }, 500)

    }

    const handlePauseSession = useCallback(() => {

        if ( timerWorkerRef.current ) {
            timerWorkerRef.current.onmessage = null
            timerWorkerRef.current.terminate()
            timerWorkerRef.current = null
        }
        if ( topTaskTodo ) {
            updateTaskTodoStateTrigger({
                pathParameters : {
                    task_id : topTaskTodo.task_id
                },
                body : {
                    current_work_time : Number(topTaskTodo.current_work_time) + timerCount
                }
            })
            queryClient.setQueryData(
                [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ],
                ( oldData : TGetUserTaskTodoStateResponseData ) => produce( oldData, draft => {
                    if ( draft.length > 0 ) {
                        draft.sort( ( a, b ) => b.display_order - a.display_order )
                        draft[0].current_work_time = ( Number(draft[0].current_work_time) + timerCount ).toString()
                    }
                } )
            )
        }
        updateTaskTodoPageStore({
            sessionActive : false,
            timerCount : 0
        })

    }, [timerCount])

    useEffect(() => {
        if ( userTaskTodoState ) {
            const totalCurrentWorkTime = userTaskTodoState.reduce( ( acc, curr ) => acc + Number(curr.current_work_time), 0 ) + timerCount
            const totalWorkTimeGoal = userTaskTodoState.reduce( ( acc, curr ) => acc + Number(curr.work_time_goal), 0 )
            updateTaskTodoPageStore({
                totalCurrentWorkTimeString : formatTaskTodoTimeSeconds(totalCurrentWorkTime),
                totalWorkTimeGoalString : formatTaskTodoTimeSeconds(totalWorkTimeGoal)
            })
        } else {
            updateTaskTodoPageStore({
                totalCurrentWorkTimeString : "0m",
                totalWorkTimeGoalString : "0m"
            })
        }
    }, [ userTaskTodoState, timerCount ])

    useEffect(() => {
        return () => {
            if ( timerWorkerRef.current ) {
                timerWorkerRef.current.terminate()
            }
        }
    }, [])

    return (
        <StateManager_TaskTodoPageContext.Provider
            value={{
                handleStartSession,
                handlePauseSession,
                userTaskTodoState,
                topTaskTodo
            }}
        >
            {children}
        </StateManager_TaskTodoPageContext.Provider>
    )

}

export default StateManager_TaskTodoPage;