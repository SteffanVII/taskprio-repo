import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { TGetProjectTaskboardsPayload, TGetProjectTaskboardsResponse, TGetTaskboardTrashTasksPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TGetProjectInactiveTaskboardsRequestQuery, TGetProjectInactiveTaskboardsResponseData, TGetTaskboardTrashTasksResponseData } from "@repo/taskprio-types"
import { AxiosError } from "axios"
import { useProjectStore_selectedProject } from "@/stores/project"
import { useParams } from "@tanstack/react-router"

//-- Get project taskboards
type TUseGetProjectTaskboardsConfig = {
  options?: Partial<UseQueryOptions<TGetProjectTaskboardsResponse, Error>>,
  payload: TGetProjectTaskboardsPayload
}

export const useGetProjectTaskboards = (config?: TUseGetProjectTaskboardsConfig) => {

  const { project_id } = useParams({ strict : false })
  const selectedProject = useProjectStore_selectedProject()
  const payload : TGetProjectTaskboardsPayload = {
    query : {
      project_id,
      ...config?.payload.query
    }
  }

  const enabled = !!selectedProject && !!payload.query.project_id && (config?.options?.enabled ?? true)

  return useQuery<TGetProjectTaskboardsResponse, Error>({
    queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, payload.query.project_id],
    queryFn: async () => {
      const response = await axiosInstance.get<TGetProjectTaskboardsResponse>(
        `/private/taskboard/s`,
        {
          params: {
            project_id: payload.query.project_id
          }
        }
      )
      return response.data
    },
    enabled
  })
}

export const useUpdateProjectTaskboardsData = ( _projectId? : string ) => {
  const selectedProject = useProjectStore_selectedProject()
  const queryClient = useQueryClient()
  const projectId = _projectId || selectedProject?.project_id
  return ( taskboards : TGetProjectTaskboardsResponse ) => {
    if (!projectId) return

    queryClient.setQueryData(
      [...QueryKeys.GET_PROJECT_TASKBOARDS.split, projectId],
      () => {
        return taskboards
      }
    )
  }
}

export const useResetProjectTaskboardsData = (_projectId? : string) => {
  const selectedProject = useProjectStore_selectedProject()
  const queryClient = useQueryClient()
  const projectId = _projectId || selectedProject?.project_id
  return () => {
    if (!projectId) return
    queryClient.resetQueries({
      queryKey : [...QueryKeys.GET_PROJECT_TASKBOARDS.split, projectId]
    })
  }
}
//-- Get project taskboards

export const useResetProjectTaskboardsQuery = ( _projectId? : string ) => {
  const selectedProject = useProjectStore_selectedProject()
  const projectId = _projectId || selectedProject?.project_id
  return async () => {
    if (projectId) {
      await useQueryClient().resetQueries({
        queryKey : [...QueryKeys.GET_PROJECT_TASKBOARDS.split, projectId]
      })
    }
  }
}

//-- Get project taskboards

type TUseGetTaskboardTrashTasksConfig = {
  payload: TGetTaskboardTrashTasksPayload,
  options?: Omit<UseQueryOptions<TGetTaskboardTrashTasksResponseData, Error>, "queryKey">
}

export const useGetTaskboardTrashTasks = (config: TUseGetTaskboardTrashTasksConfig) => {
  return useQuery<TGetTaskboardTrashTasksResponseData, Error>({
    queryKey: [...QueryKeys.GET_TASKBOARD_TRASH_TASKS.split, config.payload.params.taskboard_id],
    queryFn: async () => {
      const response = await axiosInstance.get<TGetTaskboardTrashTasksResponseData>(
        `/private/taskboard/trash-tasks/${config.payload.params.taskboard_id}`
      )
      return response.data
    },
    enabled: !!config.payload.params.taskboard_id && config.options?.enabled
  })
}

export const useGetProjectDeactivateTaskboards = (payload: TGetProjectInactiveTaskboardsRequestQuery) => {
  return useQuery<TGetProjectInactiveTaskboardsResponseData, AxiosError>({
    queryKey: [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, payload.project_id],
    queryFn: async () => {
      const response = await axiosInstance.get<TGetProjectInactiveTaskboardsResponseData>(
        `/private/taskboard/inactive`,
        {
          params: payload
        }
      )
      return response.data
    },
    enabled: !!payload.project_id
  })
}