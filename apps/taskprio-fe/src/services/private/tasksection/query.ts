import { useQuery } from "@tanstack/react-query"
import { TGetTaskboardSectionsPayload, TGetTaskboardSectionsResponse } from "./types"
import { axiosInstance } from "@/services/axios"

export const useGetTaskboardSections = ( payload : TGetTaskboardSectionsPayload ) => {
    return useQuery<TGetTaskboardSectionsResponse, Error>({
        queryKey : [ "get_taskboard_sections", payload.pathParameter.task_board_id, payload.pathQuery.include_tasks ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskboardSectionsResponse>(
                `/private/tasksection/s/${payload.pathParameter.task_board_id}`,
                { params : payload.pathQuery }
            )
            return response.data
        },
        enabled : !!payload.pathParameter.task_board_id
    })
}
