import { QueryClient, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TUpdateProjectMemberRolePayload, TUpdateUserProfilePhotoPayload, TUpdateUserProfilePhotoResponse } from "./types"
import { axiosHeaders, axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"


export const useUpdateUserProfilePhoto = ( onSuccess : () => void ) => {

    const queryClient = useQueryClient()

    return useMutation<TUpdateUserProfilePhotoResponse, Error, TUpdateUserProfilePhotoPayload>({
        mutationFn : async ( payload ) => {

            const formData = new FormData()
            formData.append( "crop_area", JSON.stringify( payload.crop_area ))
            formData.append( "photo", payload.file )

            const response = await axiosInstance.post<TUpdateUserProfilePhotoResponse>(
                `/private/profile/photo`,
                formData,
                {
                    headers : {
                        ...axiosHeaders(),
                        "Content-Type" : "multipart/form-data"
                    }
                }
            )

            return response.data

        },
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROFILE.split ]
            })
            onSuccess()
        }
    })

}

type TUpdateProjectMemberRoleOptions = UseMutationOptions<any, Error, TUpdateProjectMemberRolePayload>

export const useUpdateProjectMemberRole = ( options? : TUpdateProjectMemberRoleOptions) => {

    const queryClient = useQueryClient()

    return useMutation<any, Error, TUpdateProjectMemberRolePayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch<any>(
                `/private/project/member-role/${payload.params.project_id}/${payload.params.member_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            options?.onSuccess?.( data, variables, context )
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_MEMBERS.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_MEMBER.split, variables.params.project_id, variables.params.member_id ]
            })
        }
    })

}