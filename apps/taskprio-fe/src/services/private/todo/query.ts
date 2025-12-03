import { TGetTaskAssignedToUserByWorkspaceResponseData, TGetUserTaskTodoStateResponseData } from "@repo/taskprio-types/src"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetTasksAssignedToUserByWorkspacePayload, TGetUserTaskTodoStatePayload } from "./types"
import { QueryKeys } from "@/services/enum"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore_authenticated } from "@/stores/globals"

export const useGetTasksAssignedToUserByWorkspace = ( payload : TGetTasksAssignedToUserByWorkspacePayload ) => {

    return useQuery<TGetTaskAssignedToUserByWorkspaceResponseData, Error>({
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