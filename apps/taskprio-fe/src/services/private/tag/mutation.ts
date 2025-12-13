import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TCreateProjectTagPayload, TDeleteProjectTagPayload, TUpdateProjectTagPayload } from "./types";
import { TCreateProjectTagResponse, TDeleteProjectTagResponse, TUpdateProjectTagResponse } from "@repo/taskprio-types/src";
import { axiosInstance } from "@/services/axios";
import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore, useGlobalsStore_selectedProject } from "@/stores/globals";


export const useCreateProjectTag = (
    onSuccess? : ( data : TCreateProjectTagResponse ) => void
) => {

    const queryClient = useQueryClient()
    const selectedProject = useGlobalsStore_selectedProject()

    return useMutation<TCreateProjectTagResponse, Error, TCreateProjectTagPayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<TCreateProjectTagResponse>(
                `/private/tag/${payload.params.project_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            if ( selectedProject?.project_id === data.project_id ) {
                updateGlobalsStore({
                    selectedProject : {
                        ...selectedProject,
                        project_tags : [
                            ...selectedProject.project_tags,
                            data
                        ]
                    }
                })
            }
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_TAGS.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split ]
            })
            onSuccess?.( data )
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
                queryKey : [ ...QueryKeys.GET_PROJECT_TAGS.split, variables.params.project_id ]
            })
        }
    })

}

export const useDeleteProjectTag = (
    onSuccess? : ( data : TDeleteProjectTagResponse ) => void
) => {

    const queryClient = useQueryClient()
    const selectedProject = useGlobalsStore_selectedProject()

    return useMutation<TDeleteProjectTagResponse, Error, TDeleteProjectTagPayload>({
        mutationFn : async ( payload) => {
            const response = await axiosInstance.delete<TDeleteProjectTagResponse>(
                `/private/tag/${payload.params.project_id}/${payload.params.tag_id}`
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            if ( selectedProject?.project_id === variables.params.project_id ) {
                updateGlobalsStore({
                    selectedProject : {
                        ...selectedProject,
                        project_tags : selectedProject.project_tags.filter( tag => tag.tag_id !== variables.params.tag_id )
                    }
                })
            }
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_TAGS.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split ]
            })
            onSuccess?.( data )
        }
    })

}