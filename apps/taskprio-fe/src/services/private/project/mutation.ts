import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TAddMembersToProjectPayload, TCreateProjectResponse, TUpdateProjectCustomizationPayload } from "./types"
import { TCreateProjectPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore } from "@/stores/globals"
import { TAddProjectMembersResponseData, TProject, TUpdateProjectCustomizationResponseData } from "@repo/taskprio-types/src/index"
import { QueryKeys } from "@/services/enum"


export const useCreateProject = ( successCallback? : ( project : TCreateProjectResponse ) => void ) => {

    const queryClient = useQueryClient()

    const {
        selectedWorkspace
    } = useGlobalsStore()

    return useMutation<TCreateProjectResponse, Error, TCreateProjectPayload>({
        mutationFn : async (payload : TCreateProjectPayload) => {
            const response = await axiosInstance.post<TCreateProjectResponse>(
                "/private/project",
                payload.body
            )
            return response.data
        },
        onSuccess : ( data : TCreateProjectResponse ) => {

            queryClient.setQueryData<TProject[]>([ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ], ( old ) => {
                if ( !old ) return [data]
                const foundIndex = old.findIndex( project => project.project_id === data.project_id )
                if ( foundIndex === -1 ) return [data, ...old]
                const newProjects = [...old]
                newProjects[foundIndex] = data
                return newProjects
            })

            successCallback?.(data)

        }
    })
    
}

type TUseUpdateProjectCustomizationOptions = UseMutationOptions<TUpdateProjectCustomizationResponseData, Error, TUpdateProjectCustomizationPayload>

export const useUpdateProjectCustomization = ( options? : TUseUpdateProjectCustomizationOptions ) => {

    const {
        selectedWorkspace
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<TUpdateProjectCustomizationResponseData, Error, TUpdateProjectCustomizationPayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch<TUpdateProjectCustomizationResponseData>(
                `/private/project/customization/${payload.params.project_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_PRIMITIVE.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ]
            })
            options?.onSuccess?.( data, variables, context )
        }
    })

}

type TUseAddMembersToProjectOptions = UseMutationOptions<TAddProjectMembersResponseData, Error, TAddMembersToProjectPayload>

export const useAddMembersToProject = (
    options? : TUseAddMembersToProjectOptions
) => {

    const queryClient = useQueryClient()

    return useMutation<TAddProjectMembersResponseData, Error, TAddMembersToProjectPayload>({
        ...options,
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<TAddProjectMembersResponseData>(
                `/private/project/add-members/${payload.params.project_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT_MEMBERS.split, variables.params.project_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_PROJECT.split, variables.params.project_id ]
            })
            options?.onSuccess?.( data, variables, context )
        }
    })

}