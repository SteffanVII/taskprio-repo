import { useQuery } from "@tanstack/react-query"
import { TProject } from "@repo/taskprio-types/src/index"
import { axiosInstance } from "@/services/axios"

export type TGetProjectParams = {
    project_id : string
}

export const useGetProject = ( params : TGetProjectParams ) => {

    return useQuery<TProject, Error>({
        queryKey : ["project", params.project_id],
        queryFn : async () => {
            const response = await axiosInstance.get<TProject>(
                `/private/project/${params.project_id}`,
            )
            return response.data
        }
    })

}

export const useGetProjects = ( workspace_id? : string ) => {

    return useQuery<TProject[], Error>({
        queryKey : [ "projects", workspace_id ],
        queryFn : async () => {
            const response = await axiosInstance.get<TProject[]>(
                `/private/project/s/${workspace_id}`
            )
            return response.data
        },
        enabled : !!workspace_id
    })
    
}