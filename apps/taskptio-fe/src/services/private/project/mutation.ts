import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TCreateProjectResponse, TProject } from "./types"
import { TCreateProjectPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore } from "@/stores/globals"


export const useCreateProject = () => {

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

            queryClient.setQueryData<TProject[]>([ "projects", selectedWorkspace?.workspace_id ], ( old ) => {
                if ( !old ) return [data]
                const foundIndex = old.findIndex( project => project.project_id === data.project_id )
                if ( foundIndex === -1 ) return [data, ...old]
                const newProjects = [...old]
                newProjects[foundIndex] = data
                return newProjects
            })

        }
    })
    
}