import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetProjectTaskboardsPayload, TGetProjectTaskboardsResponse, TGetTaskboardTrashTasksPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetProjectInactiveTaskboardsRequestQuery, TGetProjectInactiveTaskboardsResponseData, TGetTaskboardTrashTasksResponseData } from "@repo/taskprio-types/src"
import { AxiosError } from "axios"

type TUseGetProjectTaskboardsConfig = {
    options? : Partial<UseQueryOptions<TGetProjectTaskboardsResponse, Error>>,
    payload : TGetProjectTaskboardsPayload
}

export const useGetProjectTaskboards = ( config : TUseGetProjectTaskboardsConfig ) => {
    return useQuery<TGetProjectTaskboardsResponse, Error>({
        queryKey : [ ...QueryKeys.GET_PROJECT_TASKBOARDS.split, config.payload.query.project_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetProjectTaskboardsResponse>(
                `/private/taskboard/s`,
                {
                    params : {
                        project_id : config.payload.query.project_id
                    }
                }
            )
            return response.data
        },
        enabled : !!config.payload.query.project_id && (config.options?.enabled ?? true)
    })
}

type TUseGetTaskboardTrashTasksConfig = {
    payload : TGetTaskboardTrashTasksPayload,
    options? : Omit<UseQueryOptions<TGetTaskboardTrashTasksResponseData, Error>, "queryKey"> 
}

export const useGetTaskboardTrashTasks = ( config : TUseGetTaskboardTrashTasksConfig ) => {
    return useQuery<TGetTaskboardTrashTasksResponseData, Error>({
        queryKey : [ ...QueryKeys.GET_TASKBOARD_TRASH_TASKS.split, config.payload.params.taskboard_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskboardTrashTasksResponseData>(
                `/private/taskboard/trash-tasks/${config.payload.params.taskboard_id}`
            )
            return response.data
        },
        enabled : !!config.payload.params.taskboard_id && config.options?.enabled
    })
}

export const useGetProjectDeactivateTaskboards = ( payload : TGetProjectInactiveTaskboardsRequestQuery ) => {
    return useQuery<TGetProjectInactiveTaskboardsResponseData, AxiosError>({
        queryKey : [ ...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, payload.project_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetProjectInactiveTaskboardsResponseData>(
                `/private/taskboard/inactive`,
                {
                    params : payload
                }
            )
            return response.data
        },
        enabled : !!payload.project_id
    })
}