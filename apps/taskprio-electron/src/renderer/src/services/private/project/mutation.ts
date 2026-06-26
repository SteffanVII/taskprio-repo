import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TAddMembersToProjectPayload, TCreateProjectResponse, TUpdateProjectCustomizationPayload } from "./types"
import { TCreateProjectPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"

import { TAddProjectMembersResponseData, TDeactivateProjectMemberRequestBody, TDeactivateProjectRequestBody, TDropProjectRequestQueryParams, TProject, TProjectMember, TReactivateProjectMemberRequestBody, TReactivateProjectRequestBody, TUpdateProjectCustomizationResponseData } from "@repo/taskprio-types"
import { QueryKeys } from "@/services/enum"
import { AxiosError } from "axios"
import { useNavigate, useParams } from "@tanstack/react-router"
import { produce } from "immer"
import { useProjectStore } from "@/stores/project"
import { useGlobalsStore } from "@/stores/globals"
import { useTaskboardStore } from "@/stores/taskboard"


export const useCreateProject = (successCallback?: (project: TCreateProjectResponse) => void) => {

  const queryClient = useQueryClient()

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

  return useMutation<TCreateProjectResponse, Error, TCreateProjectPayload>({
    mutationFn: async (payload: TCreateProjectPayload) => {
      const response = await axiosInstance.post<TCreateProjectResponse>(
        "/private/project",
        payload.body
      )
      return response.data
    },
    onSuccess: (data: TCreateProjectResponse) => {

      queryClient.setQueryData<TProject[]>([...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id], (old) => {
        if (!old) return [data]
        const foundIndex = old.findIndex(project => project.project_id === data.project_id)
        if (foundIndex === -1) return [data, ...old]
        const newProjects = [...old]
        newProjects[foundIndex] = data
        return newProjects
      })

      successCallback?.(data)

    }
  })

}

type TUseUpdateProjectCustomizationOptions = UseMutationOptions<TUpdateProjectCustomizationResponseData, Error, TUpdateProjectCustomizationPayload>

export const useUpdateProjectCustomization = (options?: TUseUpdateProjectCustomizationOptions) => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

  const queryClient = useQueryClient()

  return useMutation<TUpdateProjectCustomizationResponseData, Error, TUpdateProjectCustomizationPayload>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.patch<TUpdateProjectCustomizationResponseData>(
        `/private/project/customization/${payload.params.project_id}`,
        payload.body
      )
      return response.data
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT.split, variables.params.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_PRIMITIVE.split, variables.params.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
      })
      options?.onSuccess?.(data, variables, context)
    }
  })

}

type TUseAddMembersToProjectOptions = UseMutationOptions<TAddProjectMembersResponseData, Error, TAddMembersToProjectPayload>

export const useAddMembersToProject = (
  options?: TUseAddMembersToProjectOptions
) => {

  const queryClient = useQueryClient()

  return useMutation<TAddProjectMembersResponseData, Error, TAddMembersToProjectPayload>({
    ...options,
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<TAddProjectMembersResponseData>(
        `/private/project/add-members/${payload.params.project_id}`,
        payload.body
      )
      return response.data
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, variables.params.project_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT.split, variables.params.project_id]
      })
      options?.onSuccess?.(data, variables, context)
    }
  })

}

type TUseDeactivateProjectOptions = UseMutationOptions<any, AxiosError, TDeactivateProjectRequestBody> & {
  fromProject?: boolean,
}

export const useDeactivateProject = (options?: TUseDeactivateProjectOptions) => {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboard = useTaskboardStore(state => state.setNoTaskboards)

  const {
    workspace_id,
    project_id
  } = useParams({ strict: false })
  
  return useMutation<any, AxiosError, TDeactivateProjectRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        `/private/project/deactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {

      // Refetch workspace inactive projects
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_WORKSPACE_INACTIVE_PROJECTS.split, variables.workspace_id]
      })

      queryClient.setQueryData(
        [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, variables.workspace_id],
        (oldData : TProject[]) => {
          return !oldData ? oldData : oldData.filter( project => project.project_id !== variables.project_id )
        }
      )

      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, variables.workspace_id]
      })

      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, variables.workspace_id]
      })

      if (options?.fromProject && project_id === variables.project_id) {
        setSelectedProject(null)
        setSelectedTask(null)
        setNoTaskboard(false)
        setSelectedTaskboard(null)
        navigate({
          to: "/workspace/$workspace_id",
          params: {
            workspace_id: workspace_id!
          }
        })
      }
      options?.onSuccess?.(data, variables, context)
    }
  })

}

type TUseDropProjectOptions = UseMutationOptions<any, AxiosError, TDropProjectRequestQueryParams> & {
  fromProject?: boolean,
  fromWorkspaceSettings?: boolean
}

export const useDropProject = (options?: TUseDropProjectOptions) => {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboard = useTaskboardStore(state => state.setNoTaskboards)

  const {
    workspace_id,
    project_id
  } = useParams({ strict: false })

  return useMutation<any, AxiosError, TDropProjectRequestQueryParams>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.delete(
        `/private/project/drop`,
        {
          params: payload
        }
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {

      // Refetch workspace inactive projects
      if (options?.fromWorkspaceSettings) {
        queryClient.invalidateQueries({
          queryKey: [...QueryKeys.GET_PROJECT_INACTIVE_TASKBOARDS.split, variables.project_id]
        })
      }

      queryClient.setQueryData(
        [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, variables.workspace_id],
        (oldData : TProject[]) => {
          return !oldData ? oldData : oldData.filter( project => project.project_id !== variables.project_id )
        }
      )

      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, variables.workspace_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, variables.workspace_id]
      })

      if (options?.fromProject && project_id === variables.project_id) {
        setSelectedProject(null)
        setSelectedTask(null)
        setNoTaskboard(false)
        setSelectedTaskboard(null)
        navigate({
          to: "/workspace/$workspace_id",
          params: {
            workspace_id: workspace_id!
          }
        })
      }
      options?.onSuccess?.(data, variables, context)
    },
  })

}

type TUseReactivateProjectOptions = UseMutationOptions<any, AxiosError, TReactivateProjectRequestBody>

export const useReactivateProject = (options?: TUseReactivateProjectOptions) => {

  const queryClient = useQueryClient()

  return useMutation<any, AxiosError, TReactivateProjectRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        `/private/project/reactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, variables.workspace_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, variables.workspace_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, variables.workspace_id]
      })
      options?.onSuccess?.(data, variables, context)
    }

  })

}

type TUseDeactivateProjectMemberOptions = UseMutationOptions<any, AxiosError, TDeactivateProjectMemberRequestBody>

export const useDeactivateProjectMember = (options?: TUseDeactivateProjectMemberOptions) => {

  const queryClient = useQueryClient()

  return useMutation<any, AxiosError, TDeactivateProjectMemberRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.patch(
        `/private/project/member/deactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_MEMBER.split, variables.project_id, variables.member_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, variables.project_id]
      })
      queryClient.setQueryData(
        [...QueryKeys.GET_PROJECT_MEMBER.split, variables.project_id, variables.member_id],
        (oldData: TProjectMember) => produce(oldData, (draft) => {
          draft.is_active = false
        })
      )
      options?.onSuccess?.(data, variables, context)
    }
  })

}

type TUseReactivateProjectMemberOptions = UseMutationOptions<any, AxiosError, TReactivateProjectMemberRequestBody>

export const useReactivateProjectMember = (options?: TUseReactivateProjectMemberOptions) => {

  const queryClient = useQueryClient()

  return useMutation<any, AxiosError, TReactivateProjectMemberRequestBody>({
    mutationFn: async (payload) => {
      const response = await axiosInstance.patch(
        `/private/project/member/reactivate`,
        payload
      )
      return response.data
    },
    ...options,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_MEMBER.split, variables.project_id, variables.member_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, variables.project_id]
      })
      queryClient.setQueryData(
        [...QueryKeys.GET_PROJECT_MEMBER.split, variables.project_id, variables.member_id],
        (oldData: TProjectMember) => produce(oldData, (draft) => {
          draft.is_active = true
        })
      )
      options?.onSuccess?.(data, variables, context)
    }
  })

}