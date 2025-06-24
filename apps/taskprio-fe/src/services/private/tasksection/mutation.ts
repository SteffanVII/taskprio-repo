import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TCreateTaskboardSectionPayload, TCreateTaskboardSectionResponse, TGetTaskboardSectionsResponse, TUpdateTaskboardSectionPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore } from "@/stores/globals"

export const useCreateTaskboardSection = () => {

    const queryClient = useQueryClient()

    return useMutation<TCreateTaskboardSectionResponse, Error, TCreateTaskboardSectionPayload>({
        mutationFn : async ( payload : TCreateTaskboardSectionPayload ) => {
            const response = await axiosInstance.post<TCreateTaskboardSectionResponse>(
                "/private/tasksection",
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variable ) => {
            queryClient.setQueryData(
                [ "get_taskboard_sections", variable.body.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => {
                    return [ ...oldData, {
                        ...data,
                        tasks : []
                    } ]
                }
            )
        }
    })
}

export const useUpdateTaskboardSection = () => {

    const queryClient = useQueryClient()

    const {
        selectedTaskboard
    } = useGlobalsStore()

    return useMutation<any, Error, TUpdateTaskboardSectionPayload>({
        mutationFn : async ( payload : TUpdateTaskboardSectionPayload ) => {
            const response = await axiosInstance.patch<any>(
                `/private/tasksection/${payload.task_section_id}`,
                payload.body
            )
            return response.data
        },
        onMutate : async ( payload : TUpdateTaskboardSectionPayload ) => {
            queryClient.setQueryData(
                [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => {
                    const newData = oldData.map( ( taskSection ) => {
                        if ( taskSection.task_section_id === payload.task_section_id ) {
                            return { ...taskSection, ...payload.body }
                        }
                        return taskSection
                    } )
                    return newData.sort( ( a, b ) => a.display_order - b.display_order )
                }
            )
        }
    })

}