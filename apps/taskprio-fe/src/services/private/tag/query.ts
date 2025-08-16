import { axiosInstance } from "@/services/axios"
import { TGetProjectTagsResponse } from "@repo/taskprio-types/src"
import { useQuery } from "@tanstack/react-query"


export const useGetProjectTags = ( projectId? : string ) => {

    return useQuery<TGetProjectTagsResponse>({
        queryKey : [ "project", "tags", projectId ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetProjectTagsResponse>(
                `/private/tag/s/${projectId}`
            )
            return response.data
        },
        enabled : !!projectId
    })

}