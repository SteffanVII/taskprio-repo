import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TCreateProjectTagPayload, TDeleteProjectTagPayload, TUpdateProjectTagPayload } from "./types";
import { TCreateProjectTagResponse, TDeleteProjectTagResponse, TUpdateProjectTagResponse } from "@repo/taskprio-types/src";
import { axiosInstance } from "@/services/axios";


export const useCreateProjectTag = (
    onSuccess? : ( data : TCreateProjectTagResponse ) => void
) => {

    const queryClient = useQueryClient()

    return useMutation<TCreateProjectTagResponse, Error, TCreateProjectTagPayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<TCreateProjectTagResponse>(
                `/private/tag/${payload.params.project_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            onSuccess?.( data )
            queryClient.invalidateQueries({
                queryKey : ["project", "tags", variables.params.project_id]
            })
        }
    })

}

export const useUpdateProjectTag = (
    onSuccess? : ( data : TUpdateProjectTagResponse ) => void
) => {

    const queryClient = useQueryClient()

    return useMutation<TUpdateProjectTagResponse, Error, TUpdateProjectTagPayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch<TUpdateProjectTagResponse>(
                `/private/tag/${payload.params.project_id}/${payload.params.tag_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            onSuccess?.( data )
            queryClient.invalidateQueries({
                queryKey : ["project", "tags", variables.params.project_id]
            })
        }
    })

}

export const useDeleteProjectTag = (
    onSuccess? : ( data : TDeleteProjectTagResponse ) => void
) => {

    const queryClient = useQueryClient()

    return useMutation<TDeleteProjectTagResponse, Error, TDeleteProjectTagPayload>({
        mutationFn : async ( payload) => {
            const response = await axiosInstance.delete<TDeleteProjectTagResponse>(
                `/private/tag/${payload.params.project_id}/${payload.params.tag_id}`
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            onSuccess?.( data )
            queryClient.invalidateQueries({
                queryKey : ["project", "tags", variables.params.project_id]
            })
        }
    })

}