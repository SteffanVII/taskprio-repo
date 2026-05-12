import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetProjectTagsResponse } from "@repo/taskprio-types"
import { useQuery } from "@tanstack/react-query"


export const useGetProjectTags = (projectId?: string) => {

    return useQuery<TGetProjectTagsResponse>({
        queryKey: [...QueryKeys.GET_PROJECT_TAGS.split, projectId],
        queryFn: async () => {
            const response = await axiosInstance.get<TGetProjectTagsResponse>(
                `/private/tag/s/${projectId}`
            )
            return response.data
        },
        enabled: !!projectId
    })

}