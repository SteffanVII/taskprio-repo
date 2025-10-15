import { useQuery } from "@tanstack/react-query"
import { TGetTaskboardSectionsPayload, TGetTaskboardSectionsResponse } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"

export const useGetTaskboardSections = ( payload : TGetTaskboardSectionsPayload ) => {
    return useQuery<TGetTaskboardSectionsResponse, Error>({
        queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, payload.pathParameter.task_board_id, payload.pathQuery.include_tasks ],
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
