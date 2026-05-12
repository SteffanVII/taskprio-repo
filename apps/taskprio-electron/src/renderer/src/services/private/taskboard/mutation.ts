import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { updateGlobalsStore } from "@/stores/globals"
import { TCreateTaskboardRequestBody, TDeactivateTaskboardRequestBody, TDropTaskboardRequestQuery, TReactivateTaskboardRequestBody, TTaskboard, TTaskboardInactiveForTable } from "@repo/taskprio-types"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useNavigate, useParams } from "react-router"

type TUseCreateTaskboardOptions = UseMutationOptions<TTaskboard, Error, TCreateTaskboardRequestBody>

export const useCreateTaskboard = (options?: TUseCreateTaskboardOptions) => {

    const queryClient = useQueryClient();

    return useMutation<TTaskboard, Error, TCreateTaskboardRequestBody>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/taskboard/create`,
                payload
            )
            return response.data
        },
        ...options,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split]
            })
            options?.onSuccess?.(data, variables, context)
        }
    })
}

type TUseDeactivateTaskboardOptions = UseMutationOptions<any, Error, TDeactivateTaskboardRequestBody>

export const useDeactivateTaskboard = (options?: TUseDeactivateTaskboardOptions) => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const {
        workspace_id,
        project_id,
        task_board_id
    } = useParams()

    return useMutation<any, Error, TDeactivateTaskboardRequestBody>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/taskboard/deactivate`,
                payload
            )
            return response.data
        },
        ...options,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
            })
            console.log(task_board_id);
            console.log(variables.taskboard_id);
            console.log(task_board_id === variables.taskboard_id);
            if (task_board_id && task_board_id === variables.taskboard_id) {
                navigate(`/p/w/${workspace_id}/d/${project_id}/t`)
                updateGlobalsStore({
                    selectedTask: null
                })
            }
            options?.onSuccess?.(data, variables, context)
        },
    })

}

type TUseReactivateTaskboardOptions = UseMutationOptions<any, Error, TReactivateTaskboardRequestBody>

export const useReactivateTaskboard = (options?: TUseReactivateTaskboardOptions) => {

    const queryClient = useQueryClient()

    return useMutation<any, Error, TReactivateTaskboardRequestBody>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.post(
                `/private/taskboard/reactivate`,
                payload
            )
            return response.data
        },
        ...options,
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData<TTaskboardInactiveForTable[]>(
                [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id],
                (oldData) => {
                    if (oldData) {
                        return oldData.filter(taskboard => taskboard.task_board_id !== variables.taskboard_id)
                    }
                    return oldData
                }
            )
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
            })
            options?.onSuccess?.(data, variables, context)
        }

    })

}

type TUseDropTaskboardOptions = UseMutationOptions<any, AxiosError, TDropTaskboardRequestQuery>

export const useDropTaskboard = (options?: TUseDropTaskboardOptions) => {

    const queryClient = useQueryClient()

    return useMutation<any, AxiosError, TDropTaskboardRequestQuery>({
        mutationFn: async (payload) => {
            const response = await axiosInstance.delete(
                `/private/taskboard/drop`,
                {
                    params: payload
                }
            )
            return response.data
        },
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
            })
            options?.onSuccess?.(data, variables, context)
        },
    })

}