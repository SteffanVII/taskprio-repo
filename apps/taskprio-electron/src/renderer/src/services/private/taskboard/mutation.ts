import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { TCreateTaskboardRequestBody, TDeactivateTaskboardRequestBody, TDropTaskboardRequestQuery, TReactivateTaskboardRequestBody, TTaskboard, TTaskboardInactiveForTable } from "@repo/taskprio-types"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useGlobalsStore } from "@/stores/globals"

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
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split]
      })
      console.log(taskboard_id);
      console.log(variables.taskboard_id);
      console.log(taskboard_id === variables.taskboard_id);
      if (taskboard_id && taskboard_id === variables.taskboard_id) {
        // navigate(`/p/w/${workspace_id}/d/${project_id}/t`)
        navigate({
          to: "/workspace/$workspace_id/project/$project_id/taskboard",
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

type TUseDropTaskboardOptions = UseMutationOptions<any, AxiosError, TDropTaskboardRequestQuery>

export const useDropTaskboard = (options?: TUseDropTaskboardOptions) => {

  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_TASKBOARDS.split, variables.project_id]
      })
      options?.onSuccess?.(data, variables, context)
    },
  })

}