import { useQuery } from "@tanstack/react-query"
import { TGetProjectTaskboardsPayload, TGetProjectTaskboardsResponse } from "./types"
import { axiosInstance } from "@/services/axios"

export const useGetProjectTaskboards = ( payload : TGetProjectTaskboardsPayload ) => {
    return useQuery<TGetProjectTaskboardsResponse, Error>({
        queryKey : [ "get_project_taskboards", payload.query.project_id ],
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