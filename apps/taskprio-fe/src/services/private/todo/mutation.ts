import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TFinishTaskTodoSessionPayload, TMoveTaskToTodoPayload, TRemoveTaskFromTodoPayload, TStartOrStopTaskTodoTimerPayload, TUpdateTaskTodoStatePayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals"

import { TGetTaskAssignedToUserByWorkspaceResponseData, TGetUserTaskTodoStateResponseData, TStartOrStopTaskTodoTimerResponseData, TUserTaskTodoState } from "@repo/taskprio-types/src"
import { produce } from "immer"
import { AxiosError } from "axios"

export const useMoveTaskToTodo = ( onSuccess?: () => void ) => {

    const queryClient = useQueryClient()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    return useMutation({
        mutationFn: async (payload: TMoveTaskToTodoPayload) => {
            const response = await axiosInstance.post(
                `/private/todo/add-to-todo/${payload.pathParameters.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate: (variables) => {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetTaskAssignedToUserByWorkspaceResponseData) => produce(oldData, draft => {
                    draft.forEach(project => {
                        project.tasks = project.tasks.filter(task => task.task_id !== variables.pathParameters.task_id)
                    })
                })
            )
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                    draft.push({
                        ...variables.optimisticHelpers?.task as TUserTaskTodoState,
                        display_order: variables.body.display_order || 0,
                        current_work_time: "0",
                        work_time_goal: "900",
                        timers: [],
                        active: true
                    })
                })
            )
        },
        onSuccess: () => {
            onSuccess?.()
        }
    })

}

export const useUpdateTaskTodoState = (onSuccess?: () => void, invalidateQueriesException?: string[]) => {

    const queryClient = useQueryClient()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    return useMutation({
        mutationFn: async (payload: TUpdateTaskTodoStatePayload) => {
            const response = await axiosInstance.patch(
                `/private/todo/${payload.pathParameters.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate: (variables) => {
            if (!invalidateQueriesException?.includes(QueryKeys.GET_USER_TASK_TODO_STATE.value)) {
                queryClient.setQueryData(
                    [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                    (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                        draft.forEach(task => {
                            if (task.task_id === variables.pathParameters.task_id) {
                                if (variables.body.display_order) {
                                    task.display_order = variables.body.display_order
                                }
                                if (variables.body.active) {
                                    task.active = variables.body.active
                                }
                                if (variables.body.current_work_time) {
                                    task.current_work_time = variables.body.current_work_time.toString()
                                }
                                if (variables.body.work_time_goal) {
                                    task.work_time_goal = variables.body.work_time_goal.toString()
                                }
                            }
                        })
                    })
                )
            }
        },
        onSuccess: () => {
            onSuccess?.()
        }
    })

}

export const useRemoveTaskFromTodo = (onSuccess?: () => void) => {

    const queryClient = useQueryClient()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    return useMutation({
        mutationFn: async (payload: TRemoveTaskFromTodoPayload) => {
            const response = await axiosInstance.delete(
                `/private/todo/${payload.pathParameters.task_id}`
            )
            return response.data
        },
        onMutate: (variables) => {
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                    const index = draft.findIndex(task => task.task_id === variables.pathParameters.task_id)
                    if (index !== -1) {
                        draft.splice(index, 1)
                    }
                })
            )
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            onSuccess?.()
        }
    })

}

type TUseFinishTaskTodoSessionOptions = UseMutationOptions<any, Error, TFinishTaskTodoSessionPayload>

export const useFinishTaskTodoSession = (options?: TUseFinishTaskTodoSessionOptions) => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TFinishTaskTodoSessionPayload>({
        mutationFn: async (payload: TFinishTaskTodoSessionPayload) => {
            const response = await axiosInstance.post(
                `/private/todo/finish-session/${payload.pathParameters.workspace_id}`,
            )
            return response.data
        },
        ...options,
        onSuccess: (_, data, ctx) => {
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                    draft.forEach(task => {
                        task.timers = []
                    })
                })
            )
            options?.onSuccess?.(_, data, ctx)
        }
    })
}

type TUseStartOrStopTaskTodoTimerConfig = UseMutationOptions<TStartOrStopTaskTodoTimerResponseData, AxiosError, TStartOrStopTaskTodoTimerPayload>

export const useStartOrStopTaskTodoTimer = (options?: TUseStartOrStopTaskTodoTimerConfig) => {

    const queryClient = useQueryClient()

    // const user = useGlobalsStore_user()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    return useMutation<TStartOrStopTaskTodoTimerResponseData, AxiosError, TStartOrStopTaskTodoTimerPayload>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/todo/start-or-stop/${payload.pathParameters.task_id}`
            )
            return response.data
        },
        ...options,
        onSuccess( data, variables, context ) {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id ],
                ( oldData : TGetUserTaskTodoStateResponseData ) => produce( oldData, draft => {
                    if ( draft && draft.length > 0 ) {
                        const taskTodoIndex = draft.findIndex( todo => todo.task_id === variables.pathParameters.task_id )
                        if ( taskTodoIndex > -1 ) {
                            if ( data.stop === null ) {
                                draft[taskTodoIndex].timers.unshift(data);
                            } else {
                                const timerIndex = draft[taskTodoIndex].timers.findIndex( timer => timer.stop === null )
                                if ( timerIndex > -1 ) {
                                    draft[taskTodoIndex].timers[timerIndex] = data;
                                }
                            }
                        }
                    }
                } )
            )
            // queryClient.invalidateQueries({
            //     queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id ]
            // })
            options?.onSuccess?.( data, variables, context )
        },
    })

}