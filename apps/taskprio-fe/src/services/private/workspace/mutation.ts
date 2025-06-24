import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TCreateWorkspacePayload, TCreateWorkspaceResponse, TGetUserWorkspacesResponse, TInviteToWorkspacePayload } from "./types"
import { axiosInstance } from "@/services/axios"


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
            queryClient.setQueryData<TGetUserWorkspacesResponse>( [ "get_user_workspaces" ], old => {
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