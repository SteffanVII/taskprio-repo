import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TCreateWorkspacePayload, TCreateWorkspaceResponse, TGetUserWorkspacesResponse, TInviteToWorkspacePayload, TUpdateWorkspaceMemberRolePayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"


export const useCreateWorkspace = ( onSuccess? : () => void ) => {

    const queryClient = useQueryClient()

    return useMutation<TCreateWorkspaceResponse, any, TCreateWorkspacePayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<TCreateWorkspaceResponse>(
                `/private/workspace`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data ) => {
            queryClient.setQueryData<TGetUserWorkspacesResponse>( [ ...QueryKeys.GET_USER_WORKSPACES.split ], old => {
                if ( !old ) return [ data ]
                console.log(data);
                return [ data, ...old ]
            } )
            if ( onSuccess ) onSuccess()
        }
    })
}

export const useInviteToWorkspace = ( onSuccess? : () => void ) => {

    return useMutation<any, any, TInviteToWorkspacePayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<any>(
                `/private/invitation/workspace/${payload.workspace_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : () => {
            if ( onSuccess ) onSuccess()
        }
    })

}

type TUpdateWorkspaceMemberRoleOptions = UseMutationOptions<any, Error, TUpdateWorkspaceMemberRolePayload>

export const useUpdateWorkspaceMemberRole = ( options? : TUpdateWorkspaceMemberRoleOptions ) => {

    const queryClient = useQueryClient()

    return useMutation<any, Error, TUpdateWorkspaceMemberRolePayload>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch<any>(
                `/private/workspace/member-role/${payload.params.workspace_id}/${payload.params.member_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            options?.onSuccess?.( data, variables, context )
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_WORKSPACE.split, variables.params.workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_WORKSPACE_MEMBER.split, variables.params.workspace_id, variables.params.member_id ]
            })
        }
    })

}