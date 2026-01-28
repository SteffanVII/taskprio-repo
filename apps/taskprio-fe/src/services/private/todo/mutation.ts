import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TCommitTaskTodoPayload, TCompleteTaskTodoPayload, TFinishTaskTodoSessionPayload, TMoveTaskToTodoPayload, TRemoveTaskFromTodoPayload, TStartOrStopTaskTodoTimerPayload, TUpdateTaskTodoStatePayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"

import { TGetAvailableTasksByProjectRequestQuery, TGetAvailableTasksByProjectResponseData, TGetUserTaskTodoStateResponseData, TStartOrStopTaskTodoTimerResponseData, TUserTaskTodoState } from "@repo/taskprio-types"
import { produce } from "immer"
import { AxiosError } from "axios"
import { useTaskTodoPageStore_projectColumnsFilterState } from "@/stores/taskTodoPage"

export const useMoveTaskToTodo = (onSuccess?: () => void) => {

    const queryClient = useQueryClient()

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
    const projectColumnsFilterState = useTaskTodoPageStore_projectColumnsFilterState()

    return useMutation({
        mutationFn: async (payload: TMoveTaskToTodoPayload) => {
            const response = await axiosInstance.post(
                `/private/todo/add-to-todo/${payload.pathParameters.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate: (variables) => {

            const filtersKey: Partial<TGetAvailableTasksByProjectRequestQuery> = {}

            if (variables.optimisticHelpers?.task.project_id) {
                const search = projectColumnsFilterState[variables.optimisticHelpers?.task.project_id]?.search
                if (!!search && search.trim() !== "") {
                    filtersKey["search"] = search
                }
                const taskboards = projectColumnsFilterState[variables.optimisticHelpers?.task.project_id]?.taskboards
                if (!!taskboards && taskboards.length > 0) {
                    filtersKey["taskboards"] = taskboards
                }
            }

            queryClient.setQueryData(
                [...QueryKeys.GET_AVAILABLE_TASKS_BY_PROJECT.split, variables.optimisticHelpers?.task.project_id, JSON.stringify(filtersKey)],
                (oldData: TGetAvailableTasksByProjectResponseData) => produce(oldData, draft => {
                    if (draft) {
                        draft.tasks = draft.tasks.filter(task => task.task_id !== variables.pathParameters.task_id)
                    }
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

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

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
                        const taskIndex = draft.findIndex(task => task.task_id === variables.pathParameters.task_id)
                        if (taskIndex > -1) {
                            if (variables.body.display_order) {
                                draft[taskIndex].display_order = variables.body.display_order
                            }
                            if (variables.body.active) {
                                draft[taskIndex].active = variables.body.active
                            }
                            if (variables.body.current_work_time) {
                                draft[taskIndex].current_work_time = variables.body.current_work_time.toString()
                            }
                            if (variables.body.work_time_goal) {
                                draft[taskIndex].work_time_goal = variables.body.work_time_goal.toString()
                            }
                        }
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

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

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
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_AVAILABLE_TASKS_BY_PROJECT.split, variables.optimisticHelpers?.task.project_id]
            })
            onSuccess?.()
        }
    })

}

type TUseFinishTaskTodoSessionOptions = UseMutationOptions<any, Error, TFinishTaskTodoSessionPayload>

export const useFinishTaskTodoSession = (options?: TUseFinishTaskTodoSessionOptions) => {

    const queryClient = useQueryClient()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

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
                (oldData: TGetUserTaskTodoStateResponseData) => {
                    return [...(oldData || [])].filter(task => {

                        if (task.completed) {
                            queryClient.invalidateQueries({
                                queryKey: [...QueryKeys.GET_AVAILABLE_TASKS_BY_PROJECT.split, task.project_id]
                            })
                        }

                        return !task.completed
                    }).map(task => {
                        const newTask = { ...task }
                        newTask.timers = []
                        return newTask
                    })
                }
            )
            options?.onSuccess?.(_, data, ctx)
        }
    })
}

type TUseStartOrStopTaskTodoTimerConfig = UseMutationOptions<TStartOrStopTaskTodoTimerResponseData, AxiosError, TStartOrStopTaskTodoTimerPayload>

export const useStartOrStopTaskTodoTimer = (options?: TUseStartOrStopTaskTodoTimerConfig) => {

    const queryClient = useQueryClient()

    // const user = useGlobalsStore_user()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    return useMutation<TStartOrStopTaskTodoTimerResponseData, AxiosError, TStartOrStopTaskTodoTimerPayload>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/todo/start-or-stop/${payload.pathParameters.task_id}`
            )
            return response.data
        },
        ...options,
        onSuccess(data, variables, context) {
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                    if (draft && draft.length > 0) {
                        const taskTodoIndex = draft.findIndex(todo => todo.task_id === variables.pathParameters.task_id)
                        if (taskTodoIndex > -1) {
                            if (data.stop === null) {
                                draft[taskTodoIndex].timers.unshift(data);
                            } else {
                                const timerIndex = draft[taskTodoIndex].timers.findIndex(timer => timer.stop === null)
                                if (timerIndex > -1) {
                                    draft[taskTodoIndex].timers[timerIndex] = data;
                                }
                            }
                        }
                    }
                })
            )
            // queryClient.invalidateQueries({
            //     queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id ]
            // })
            options?.onSuccess?.(data, variables, context)
        },
    })

}

type TUseCommitTaskTodoOptions = UseMutationOptions<any, AxiosError, TCommitTaskTodoPayload>

export const useCommitTaskTodo = (options?: TUseCommitTaskTodoOptions) => {

    const queryClient = useQueryClient()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    return useMutation<any, AxiosError, TCommitTaskTodoPayload>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/todo/commit/${payload.pathParameters.task_id}`
            )
            return response.data
        },
        ...options,
        onMutate(variables) {
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
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_AVAILABLE_TASKS_BY_PROJECT.split, variables.optimisticHelpers?.task.project_id]
            })
            options?.onSuccess?.(data, variables, context)

        },
    })

}

type TUseCompleteTaskTodoOptions = UseMutationOptions<any, AxiosError, TCompleteTaskTodoPayload>

export const useCompleteTaskTodo = (options?: TUseCompleteTaskTodoOptions) => {

    const queryClient = useQueryClient()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    return useMutation<any, AxiosError, TCompleteTaskTodoPayload>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/todo/complete/${payload.pathParameters.task_id}`,
                payload.body
            )
            return response.data
        },
        ...options,
        onMutate(variables) {
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id],
                (oldData: TGetUserTaskTodoStateResponseData) => produce(oldData, draft => {
                    const index = draft.findIndex(task => task.task_id === variables.pathParameters.task_id)
                    if (index !== -1) {
                        draft[index].completed = variables.body.completed
                    }
                })
            )
        },
    })

}