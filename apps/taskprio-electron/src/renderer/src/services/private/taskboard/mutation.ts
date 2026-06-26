import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TCreateTaskboardRequestBody, TDeactivateTaskboardRequestBody, TDropTaskboardRequestQuery, TReactivateTaskboardRequestBody, TTaskboard, TTaskboardInactiveForTable } from "@repo/taskprio-types"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useGlobalsStore } from "@/stores/globals"
import { TGetProjectTaskboardsResponse } from "./types"

type TUseCreateTaskboardOptions = UseMutationOptions<TTaskboard, Error, TCreateTaskboardRequestBody>

export const useCreateTaskboard = (options?: TUseCreateTaskboardOptions) => {

  const queryClient = useQueryClient();

  return useMutation<TTaskboard, Error, TCreateTaskboardRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        `/private/taskboard/create`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split]
      })
      options?.onSuccess?.(data, variables, context)
    }
  })
}

type TUseDeactivateTaskboardOptions = UseMutationOptions<any, Error, TDeactivateTaskboardRequestBody>

export const useDeactivateTaskboard = (options?: TUseDeactivateTaskboardOptions) => {

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const {
    workspace_id,
    project_id,
    taskboard_id
  } = useParams({strict: false})

  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)

  return useMutation<any, Error, TDeactivateTaskboardRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        `/private/taskboard/deactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {

      queryClient.setQueryData(
        [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id],
        (oldData : TGetProjectTaskboardsResponse) => {
          return !oldData ? oldData :  oldData.filter( taskboard => taskboard.task_board_id !== variables.taskboard_id )
        }
      )

      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
      })

      // Navigate to project page if the current taskboard is deactivated
      if (taskboard_id && taskboard_id === variables.taskboard_id) {
        navigate({
          to: "/workspace/$workspace_id/project/$project_id",
          params: {
            workspace_id: workspace_id!,
            project_id: project_id!
          }
        })
        setSelectedTask(null)
      }
      options?.onSuccess?.(data, variables, context)
    },
  })

}

type TUseReactivateTaskboardOptions = UseMutationOptions<any, Error, TReactivateTaskboardRequestBody>

export const useReactivateTaskboard = (options?: TUseReactivateTaskboardOptions) => {

  const queryClient = useQueryClient()

  return useMutation<any, Error, TReactivateTaskboardRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        `/private/taskboard/reactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<TTaskboardInactiveForTable[]>(
        [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id],
        (oldData) => {
          if (oldData) {
            return oldData.filter(taskboard => taskboard.task_board_id !== variables.taskboard_id)
          }
          return oldData
        }
      )
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
      })
      options?.onSuccess?.(data, variables, context)
    }

  })

}

type TUseDropTaskboardOptions = UseMutationOptions<any, AxiosError, TDropTaskboardRequestQuery> & {
  fromTaskboard?: boolean,
  fromProjectSettings?: boolean,
}

export const useDropTaskboard = (options?: TUseDropTaskboardOptions) => {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { workspace_id, project_id, taskboard_id } = useParams({ strict: false })

  return useMutation<any, AxiosError, TDropTaskboardRequestQuery>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.delete(
        `/private/taskboard/drop`,
        {
          params: payload
        }
      )
      return response.data
    },
    onSuccess(data, variables, context) {

      queryClient.setQueryData(
        [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id],
        (oldData : TGetProjectTaskboardsResponse) => {
          return !oldData ? oldData :  oldData.filter( taskboard => taskboard.task_board_id !== variables.taskboard_id )
        }
      )

      if (options?.fromProjectSettings) {
        queryClient.invalidateQueries({
          queryKey : [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id]
        })
      }

      // Navigate to project page if the current taskboard is dropped
      if (taskboard_id === variables.taskboard_id && options?.fromTaskboard) {
        navigate({
          to: "/workspace/$workspace_id/project/$project_id",
          params: {
            workspace_id: workspace_id!,
            project_id: project_id!
          }
        })
      }
      options?.onSuccess?.(data, variables, context)
    },
  })

}