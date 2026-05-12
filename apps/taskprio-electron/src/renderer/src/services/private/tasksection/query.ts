import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetTaskboardSectionsPayload, TGetTaskboardSectionsResponse } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"

type TUseGetTaskboardSectionsConfig = {
    options? : Partial<UseQueryOptions<TGetTaskboardSectionsResponse, Error>>,
    payload : TGetTaskboardSectionsPayload
}

export const useGetTaskboardSections = ( config : TUseGetTaskboardSectionsConfig ) => {
    return useQuery<TGetTaskboardSectionsResponse, Error>({
        queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, config.payload.pathParameter.task_board_id, config.payload.pathQuery.include_tasks ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetTaskboardSectionsResponse>(
                `/private/tasksection/s/${config.payload.pathParameter.task_board_id}`,
                { params : config.payload.pathQuery }
            )
            return response.data
        },
        enabled : !!config.payload.pathParameter.task_board_id && (config.options?.enabled ?? true)
    })
}
