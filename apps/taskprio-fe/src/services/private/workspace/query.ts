import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TGetUserWorkspaceResponse, TGetUserWorkspacesResponse } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore } from "@/stores/globals"

export const useGetUserWorkspaces = () => {
    
    const {
        authenticated
    } = useGlobalsStore()

    return useQuery<any, any, TGetUserWorkspacesResponse>({
        queryKey : [ "get_user_workspaces" ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetUserWorkspacesResponse>(
                `/private/workspace/s`
            )
            return response.data
        },
        placeholderData : keepPreviousData,
        enabled : authenticated
    })
}

export const useGetUserWorkspace = ( workspace_id : string ) => {
    
    const {
        authenticated
    } = useGlobalsStore()
    
    return useQuery<string, any, TGetUserWorkspaceResponse >({
        queryKey : [ "get_user_workspace", workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/private/workspace/${workspace_id}`
            )
            return response.data
        }
    })
}