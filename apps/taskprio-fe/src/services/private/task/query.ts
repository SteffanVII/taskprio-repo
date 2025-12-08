import { useQuery } from "@tanstack/react-query"
import { TGetTaskCommentsPayload, TGetTaskResponse } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetTaskCommentsResponse } from "@repo/taskprio-types/src"

export const useGetTask = ( payload : {
    pathParameter : {
        task_id? : string
    },
    enabled? : boolean
} ) => {
    return useQuery<TGetTaskResponse, Error>({
        queryKey : [ ...QueryKeys.GET_TASK.split, payload.pathParameter.task_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskResponse>(
                `/private/task/${payload.pathParameter.task_id}`
            )
            return response.data
        },
        refetchOnWindowFocus : false,
        enabled : !!payload.pathParameter.task_id && payload.enabled
    })
}

export const useGetTaskComments = ( payload : TGetTaskCommentsPayload ) => {

    return useQuery<TGetTaskCommentsResponse, Error>({
        queryKey : [ ...QueryKeys.GET_TASK_COMMENTS.split, payload.pathParameter.task_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskCommentsResponse>(
                `/private/task/comments/${payload.pathParameter.task_id}`
            )
            return response.data
        },
        enabled : !!payload.pathParameter.task_id
    })

}