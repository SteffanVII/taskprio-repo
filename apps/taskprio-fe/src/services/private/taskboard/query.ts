import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetProjectTaskboardsPayload, TGetProjectTaskboardsResponse, TGetTaskboardTrashTasksPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetTaskboardTrashTasksResponseData } from "@repo/taskprio-types/src"

export const useGetProjectTaskboards = ( payload : TGetProjectTaskboardsPayload ) => {
    return useQuery<TGetProjectTaskboardsResponse, Error>({
        queryKey : [ ...QueryKeys.GET_PROJECT_TASKBOARDS.split, payload.query.project_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetProjectTaskboardsResponse>(
                `/private/taskboard/s`,
                {
                    params : {
                        project_id : payload.query.project_id
                    }
                }
            )
            return response.data
        },
        enabled : !!payload.query.project_id
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