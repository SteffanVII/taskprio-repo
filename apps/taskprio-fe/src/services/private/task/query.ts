import { useQuery } from "@tanstack/react-query"
import { TGetTaskResponse } from "./types"
import { axiosInstance } from "@/services/axios"

export const useGetTask = ( payload : {
    pathParameter : {
        task_id? : string
    },
    enabled? : boolean
} ) => {
    return useQuery<TGetTaskResponse, Error>({
        queryKey : [ "get_task", payload.pathParameter.task_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskResponse>(
                `/private/task/${payload.pathParameter.task_id}`
            )
            return response.data
        },
        enabled : !!payload.pathParameter.task_id && payload.enabled
    })
}