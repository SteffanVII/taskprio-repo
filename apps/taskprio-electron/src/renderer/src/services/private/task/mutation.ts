import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { TAddTaskAssigneePayload, TAddTaskCommentPayload, TAddTaskTagPayload, TAddTaskTimeLogPayload, TAddTaskTimeLogResponse, TArrangeTaskPayload, TArrangeTaskResponse, TCreateTaskResponse, TGetTaskResponse, TMoveTaskToTrashPayload, TRemoveTaskAssigneePayload, TRemoveTaskTagPayload, TRestoreTaskFromTrashPayload, TUpdateTaskPrimitiveFieldsPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { useGlobalsStore, useGlobalsStore_selectedTask } from "@/stores/globals"
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { TAddTaskCommentResponseData, TAddTaskTagResponse, TCreateTaskRequestBody, TGetTaskCommentsResponse, TTask, TTaskForCardView, TTaskSectionWithTasks } from "@repo/taskprio-types"
import { TGetTaskboardSectionsResponse } from "../tasksection/types"
import { produce } from "immer"
import { QueryKeys } from "@/services/enum"

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  return useMutation<TCreateTaskResponse, Error, TCreateTaskRequestBody>({
    mutationFn: async (payload: TCreateTaskRequestBody) => {
      const response = await axiosInstance.post<TCreateTaskResponse>(
        "/private/task",
        payload
      )
      return response.data
    },
    onSuccess: (data, payload) => {
      queryClient.setQueryData(
        [...QueryKeys.GET_TASKBOARD_SECTIONS.split, payload.task_board_id, true],
        (oldData: TTaskSectionWithTasks[]) => {
          return oldData.map(taskSection => {
            if (taskSection.task_section_id === payload.task_section_id) {
              return {
                ...taskSection,
                tasks: [data, ...taskSection.tasks]
              }
            }
            return taskSection
          })
        }
      )
    }
  })
}

export const useArrangeTask = () => {
  const queryClient = useQueryClient()
  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  return useMutation<TArrangeTaskResponse, Error, TArrangeTaskPayload>({
    mutationFn: async (payload: TArrangeTaskPayload) => {
      const response = await axiosInstance.patch<TArrangeTaskResponse>(
        `/private/task/move/${payload.task_id}`,
        payload.body
      )
      return response.data
    },
    onMutate: (payload) => {
      queryClient.setQueryData(
        [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true],
        (oldData: TTaskSectionWithTasks[]) => {

          const newData = produce(oldData, draft => {
            let targetTask: TTaskForCardView | undefined;
            let targetTaskSection: TTaskSectionWithTasks | undefined;

            for (const taskSection of draft) {

              // Target section found
              if (taskSection.task_section_id === payload.body.task_section_id) {
                targetTaskSection = taskSection
              }

              // Find task in the current section if the target task is undefined
              if (targetTask === undefined) {
                const taskIndex = taskSection.tasks.findIndex(task => task.task_id === payload.task_id)
                // Task found in the current section
                if (taskIndex !== -1) {
                  // If the target section if already found
                  if (targetTaskSection) {
                    // And the target task is in the same section. Only update the display order of the task
                    if (targetTaskSection.task_section_id === taskSection.tasks[taskIndex].task_section_id) {
                      taskSection.tasks[taskIndex].display_order = payload.body.display_order
                      break
                      // If the target task is in a different section. Move the task to the target section
                    } else {
                      targetTask = taskSection.tasks.splice(taskIndex, 1)[0]
                      targetTask.task_section_id = payload.body.task_section_id
                      targetTask.display_order = payload.body.display_order
                      targetTaskSection.tasks.push(targetTask)
                      break
                    }
                    // If the target section is not found. Extract the target task
                  } else {
                    targetTask = taskSection.tasks.splice(taskIndex, 1)[0]
                  }
                }
              }

              // If both the target task and section are found. Move the target task to the target section
              if (targetTask && targetTaskSection) {
                targetTask.task_section_id = payload.body.task_section_id
                targetTask.display_order = payload.body.display_order
                targetTaskSection.tasks.push(targetTask)
                break;
              }

            }

          })

          return newData
        }
      )
    }
  })
}

export const useUpdateTaskPrimitiveFields = () => {

  const selectedTask = useGlobalsStore_selectedTask()
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)

  return useMutation<TTask, Error, TUpdateTaskPrimitiveFieldsPayload>({
    mutationFn: async (payload: TUpdateTaskPrimitiveFieldsPayload) => {
      const response = await axiosInstance.patch<TTask>(
        `/private/task/primitive-fields/${payload.task_id}`,
        payload.body
      )
      return response.data
    },
    onMutate: (payload) => {
      // Update the selected task from globals store
      
      setSelectedTask({
        ...selectedTask!,
        task_title: payload.body.task_title || selectedTask!.task_title,
        task_description: payload.body.task_description || selectedTask!.task_description
      })
    },
    // onSuccess : () => {
    //     queryClient.invalidateQueries({
    //         queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTask?.task_board_id, true ]
    //     })
    // }
  })
}

export const useAddTaskAssignee = () => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  const selectedTask = useGlobalsStore_selectedTask()
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)

  const queryClient = useQueryClient()

  return useMutation<any, Error, TAddTaskAssigneePayload>({
    mutationFn: async (payload: TAddTaskAssigneePayload) => {
      const response = await axiosInstance.post(
        `/private/task/assignee/${payload.body.task_id}`,
        payload.body
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      if (variables.optimisticData !== undefined) {
        if (variables.body.task_id === selectedTask?.task_id) {
          setSelectedTask({
            ...selectedTask,
            assignees: [...selectedTask.assignees, variables.optimisticData]
          })
        }
        queryClient.setQueryData(
          [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true],
          (oldData: TGetTaskboardSectionsResponse) => produce(oldData, draft => {
            draft.forEach(section => {
              if ("tasks" in section) {
                section.tasks.forEach(task => {
                  if (task.task_id === variables.body.task_id) {
                    task.assignees = [...task.assignees, variables.optimisticData!]
                  }
                })
              }
            })
          })
        )
      }
    }
  })
}

export const useRemoveTaskAssignee = () => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  const selectedTask = useGlobalsStore_selectedTask()
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)

  const queryClient = useQueryClient()

  return useMutation<any, Error, TRemoveTaskAssigneePayload>({
    mutationFn: async (payload: TRemoveTaskAssigneePayload) => {
      const response = await axiosInstance.delete(
        `/private/task/assignee/${payload.body.task_id}`,
        {
          data: payload.body
        }

      )
      return response.data
    },
    onSuccess: (_, variables) => {
      if (variables.body.task_id === selectedTask?.task_id) {
        setSelectedTask({
          ...selectedTask,
          assignees: selectedTask.assignees.filter(assignee => assignee.user_id === variables.body.user_id)
        })
      }
      queryClient.setQueryData(
        [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true],
        (oldData: TGetTaskboardSectionsResponse) => {
          const newData = produce(oldData, draft => {
            draft.forEach(section => {
              if ("tasks" in section) {
                section.tasks.forEach(task => {
                  if (task.task_id === variables.body.task_id) {
                    task.assignees = task.assignees.filter(assignee => assignee.user_id !== variables.body.user_id)
                  }
                })
              }
            })
          })
          return [...newData]
        }
      )
    }
  })
}

export const useAddTaskTimeLog = (
  onSuccess?: (data: TAddTaskTimeLogResponse) => void
) => {

  return useMutation<TAddTaskTimeLogResponse, Error, TAddTaskTimeLogPayload>({
    mutationFn: async (payload: TAddTaskTimeLogPayload) => {
      const response = await axiosInstance.post<TAddTaskTimeLogResponse>(
        `/private/task/log-time/${payload.task_id}`,
        payload.body
      )
      return response.data
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    }
  })
}

export const useAddTaskTag = (
  onSuccess?: (data: TAddTaskTagResponse) => void
) => {


  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  const queryClient = useQueryClient()

  return useMutation<TAddTaskTagResponse, Error, TAddTaskTagPayload>({
    mutationFn: async (payload: TAddTaskTagPayload) => {
      const response = await axiosInstance.post<TAddTaskTagResponse>(
        `/private/task/tag`,
        payload.body
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true],
        (oldData: TGetTaskboardSectionsResponse) => {
          return produce(oldData, draft => {
            draft.forEach(section => {
              if ("tasks" in section) {
                section.tasks.forEach(task => {
                  if (task.task_id === variables.body.task_id) {
                    task.tags = [...task.tags, data]
                  }
                })
              }
            })
          })
        }
      )
      onSuccess?.(data)
    }
  })

}

export const useRemoveTaskTag = (
  onSuccess?: () => void
) => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()

  const queryClient = useQueryClient()

  return useMutation<any, Error, TRemoveTaskTagPayload>({
    mutationFn: async (payload: TRemoveTaskTagPayload) => {
      const response = await axiosInstance.delete<any>(
        `/private/task/tag`,
        {
          data: payload.body
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true],
        (oldData: TGetTaskboardSectionsResponse) => produce(oldData, draft => {
          draft.forEach(section => {
            if ("tasks" in section) {
              section.tasks.forEach(task => {
                if (task.task_id === variables.body.task_id) {
                  task.tags = task.tags.filter(tag => tag.tag_id !== variables.body.tag_id)
                }
              })
            }
          })
        })
      )
      queryClient.setQueryData(
        [...QueryKeys.GET_TASK.split, variables.body.task_id],
        (oldData: TGetTaskResponse) => {
          return produce(oldData, draft => {
            draft.tags = draft.tags.filter(tag => tag.tag_id !== variables.body.tag_id)
          })
        }
      )
      onSuccess?.()
    }
  })

}

export const useAddTaskComment = (
  {
    onSuccess
  }: {
    onSuccess?: (data: TAddTaskCommentResponseData) => void
  } = {}
) => {

  const queryClient = useQueryClient()

  return useMutation<TAddTaskCommentResponseData, Error, TAddTaskCommentPayload>({
    mutationFn: async (payload: TAddTaskCommentPayload) => {
      const response = await axiosInstance.post<TAddTaskCommentResponseData>(
        `/private/task/comment/${payload.pathParameter.task_id}`,
        payload.body
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        [...QueryKeys.GET_TASK_COMMENTS.split, variables.pathParameter.task_id],
        (oldData: TGetTaskCommentsResponse) => produce(oldData, draft => {
          draft.push(data)
        })
      )
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASK_COMMENTS.split, variables.pathParameter.task_id]
      })
      onSuccess?.(data)
    }
  })

}

type TUseMoveTaskToTrashOptions = UseMutationOptions<any, Error, TMoveTaskToTrashPayload>

export const useMoveTaskToTrash = (options?: TUseMoveTaskToTrashOptions) => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const selectedTaskboard = useTaskboardStore_selectedTaskboard()

  const queryClient = useQueryClient()

  return useMutation<any, Error, TMoveTaskToTrashPayload>({
    mutationFn: async (payload: TMoveTaskToTrashPayload) => {
      const response = await axiosInstance.delete<any>(
        `/private/task/trash/${payload.params.task_id}`
      )
      return response.data
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, false]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
      })
    }

  })

}

type TUseRestoreTaskFromTrashOptions = UseMutationOptions<any, Error, TRestoreTaskFromTrashPayload>

export const useRestoreTaskFromTrash = (options?: TUseRestoreTaskFromTrashOptions) => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const selectedTaskboard = useTaskboardStore_selectedTaskboard()

  const queryClient = useQueryClient()

  return useMutation<any, Error, TRestoreTaskFromTrashPayload>({
    mutationFn: async (payload: TRestoreTaskFromTrashPayload) => {
      const response = await axiosInstance.patch<any>(
        `/private/task/restore-from-trash/${payload.params.task_id}/${payload.params.taskboard_id}`
      )
      return response.data
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKBOARD_TRASH_TASKS.split, selectedTaskboard?.task_board_id]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, false]
      })
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
      })
    }
  })

}
