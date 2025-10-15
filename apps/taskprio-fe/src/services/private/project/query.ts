import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TGetProjectMembersResponseData, TProject, TProjectMember, TProjectPrimitive } from "@repo/taskprio-types/src/index"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetProjectMemberPayload } from "./types"

export type TGetProjectParams = {
    project_id? : string
}

export const useGetProject = ( params : TGetProjectParams ) => {

    return useQuery<TProject, Error>({
        queryKey : [ ...QueryKeys.GET_PROJECT.split, params.project_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TProject>(
                `/private/project/${params.project_id}`,
            )
            return response.data
        },
        enabled : !!params.project_id
    })

}

export const useGetProjectPrimitive = ( params : TGetProjectParams ) => {

    return useQuery<TProjectPrimitive, Error>({
        queryKey : [ ...QueryKeys.GET_PROJECT_PRIMITIVE.split, params.project_id ],
    })

}

export const useGetUserProjectsByWorkspace = ( workspace_id? : string ) => {

    return useQuery<TProject[], Error>({
        queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TProject[]>(
                `/private/project/s/${workspace_id}`
            )
            return response.data
        },
        enabled : !!workspace_id
    })
    
}

export const useInvalidateGetUserProjectsByWorkspace = ( workspaceId? : string ) => {
    return useQueryClient().invalidateQueries({
        queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspaceId ]
    })
}

export const useGetProjectMembers = ( projectId? : string ) => {

    return useQuery<TGetProjectMembersResponseData, Error>({
        queryKey : [ ...QueryKeys.GET_PROJECT_MEMBERS.split, projectId ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetProjectMembersResponseData>(
                `/private/project/members/${projectId}`
            )
            return response.data
        },
        enabled : !!projectId
    })

}

export const useGetProjectMember = ( payload : TGetProjectMemberPayload ) => {

    return useQuery<any, Error, TProjectMember>({
        queryKey : [ ...QueryKeys.GET_PROJECT_MEMBER.split, payload.params.project_id, payload.params.member_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TProjectMember>(
                `/private/project/member/${payload.params.project_id}/${payload.params.member_id}`
            )
            return response.data
        },
        enabled : !!payload.params.project_id && !!payload.params.member_id
    })

}