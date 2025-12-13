import { TGetAvailableTasksByProjectRequestPathParams, TGetAvailableTasksByProjectRequestQuery, TGetAvailableTasksByProjectResponseData, TGetAvailableTasksByWorkspaceResponseData, TGetUserTaskTodoStateResponseData } from "@repo/taskprio-types/src"
import { keepPreviousData, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetTasksAssignedToUserByWorkspacePayload, TGetUserTaskTodoStatePayload } from "./types"
import { QueryKeys } from "@/services/enum"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore_authenticated } from "@/stores/globals"
import { AxiosError } from "axios"

export const useGetTasksAssignedToUserByWorkspace = ( payload : TGetTasksAssignedToUserByWorkspacePayload ) => {

    return useQuery<TGetAvailableTasksByWorkspaceResponseData, Error>({
        queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, payload.pathParameter.workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/private/todo/available-tasks/${payload.pathParameter.workspace_id}`
            )
            return response.data
        },
        enabled : !!payload.pathParameter.workspace_id
    })

}

type TUseGetAvailableTasksByProjectConfig = {
    options? : Omit<UseQueryOptions<TGetAvailableTasksByProjectResponseData, AxiosError>, "queryKey" | "queryFn">,
    payload? : {
        params? : Partial<TGetAvailableTasksByProjectRequestPathParams>,
        query? : Partial<TGetAvailableTasksByProjectRequestQuery>
    }
}

export const useGetAvailableTasksByProject = ( config? : TUseGetAvailableTasksByProjectConfig ) => {

    return useQuery<TGetAvailableTasksByProjectResponseData, AxiosError>({
        queryKey : [ ...QueryKeys.GET_AVAILABLE_TASKS_BY_PROJECT.split, config?.payload?.params?.project_id, JSON.stringify(config?.payload?.query) ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/private/todo/available-tasks-by-project/${config?.payload?.params?.project_id}`,
                {
                    params : {
                        ...config?.payload?.query,
                        taskboards : config?.payload?.query?.taskboards ? JSON.stringify(config?.payload?.query?.taskboards) : undefined
                    }
                }
            )
            return response.data;
        },
        placeholderData : keepPreviousData,
        enabled : (config?.options?.enabled ?? true) && !!config?.payload?.params?.project_id
    })

}

export const useGetUserTaskTodoState = ( payload : TGetUserTaskTodoStatePayload, config? : Partial<UseQueryOptions<TGetUserTaskTodoStateResponseData, Error>> ) => {

    const authenticated = useGlobalsStore_authenticated()

    return useQuery<TGetUserTaskTodoStateResponseData, Error>({
        queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, payload.pathParameter.workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/private/todo/todo-state/${payload.pathParameter.workspace_id}`
            )
            return response.data
        },
        refetchOnWindowFocus : config?.refetchOnWindowFocus,
        enabled : !!payload.pathParameter.workspace_id && authenticated && (config?.enabled ?? true)
    })
}