import { keepPreviousData, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { TGetUserWorkspaceResponse, TGetUserWorkspacesResponse, TGetWorkspaceMemberPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore_authenticated } from "@/stores/globals"
import { QueryKeys } from "@/services/enum"
import { TWorkspaceMember } from "@repo/taskprio-types/src"

type TUseGetUserWorkspacesOptions = Partial<UseQueryOptions<any, any, TGetUserWorkspacesResponse>>

export const useGetUserWorkspaces = ( options? : TUseGetUserWorkspacesOptions ) => {

    const authenticated = useGlobalsStore_authenticated()

    return useQuery<any, any, TGetUserWorkspacesResponse>({
        queryKey : [ ...QueryKeys.GET_USER_WORKSPACES.split ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetUserWorkspacesResponse>(
                `/private/workspace/s`
            )
            return response.data
        },
        placeholderData : keepPreviousData,
        ...options,
        enabled : authenticated && (options?.enabled ?? true)
    })
}

export const useGetUserWorkspace = ( workspace_id? : string ) => {
    
    const authenticated = useGlobalsStore_authenticated()
    
    return useQuery<string, any, TGetUserWorkspaceResponse >({
        queryKey : [ ...QueryKeys.GET_USER_WORKSPACE.split, workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/private/workspace/${workspace_id}`
            )
            return response.data
        },
        enabled : !!workspace_id && authenticated
    })
}

export const useGetWorkspaceMember = ( payload : TGetWorkspaceMemberPayload ) => {

    return useQuery<any, any, TWorkspaceMember>({
        queryKey : [ ...QueryKeys.GET_WORKSPACE_MEMBER.split, payload.params.workspace_id, payload.params.member_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TWorkspaceMember>(
                `/private/workspace/member/${payload.params.workspace_id}/${payload.params.member_id}`
            )
            return response.data
        },
        enabled : !!payload.params.workspace_id && !!payload.params.member_id
    })

}