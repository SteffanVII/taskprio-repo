import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { TAddTaskAssigneePayload, TAddTaskCommentPayload, TAddTaskTagPayload, TAddTaskTimeLogPayload, TAddTaskTimeLogResponse, TArrangeTaskPayload, TArrangeTaskResponse, TCreateTaskPayload, TCreateTaskResponse, TGetTaskResponse, TMoveTaskToTrashPayload, TRemoveTaskAssigneePayload, TRemoveTaskTagPayload, TRestoreTaskFromTrashPayload, TUpdateTaskPrimitiveFieldsPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { TAddTaskCommentResponseData, TAddTaskTagResponse, TGetTaskCommentsResponse, TTask, TTaskForCardView, TTaskSectionWithTasks, TTaskTag } from "@repo/taskprio-types/src/index"
import { TGetTaskboardSectionsResponse } from "../tasksection/types"
import { produce } from "immer"
import { QueryKeys } from "@/services/enum"

export const useCreateTask = () => {
    const queryClient = useQueryClient()
    return useMutation<TCreateTaskResponse, Error, TCreateTaskPayload>({
        mutationFn : async ( payload : TCreateTaskPayload ) => {
            const response = await axiosInstance.post<TCreateTaskResponse>(
                "/private/task",
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, payload ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, payload.body.task_board_id, true ],
                ( oldData : TTaskSectionWithTasks[] ) => {
                    return oldData.map( taskSection => {
                        if ( taskSection.task_section_id === payload.body.task_section_id ) {
                            return {
                                ...taskSection,
                                tasks : [ data, ...taskSection.tasks ]
                            }
                        }
                        return taskSection
                    } )
                }
            )
        }
    })
}

export const useArrangeTask = () => {
    const queryClient = useQueryClient()
    const {
        selectedTaskboard
    } = useGlobalsStore()
    return useMutation<TArrangeTaskResponse, Error, TArrangeTaskPayload>({
        mutationFn : async ( payload : TArrangeTaskPayload ) => {
            const response = await axiosInstance.patch<TArrangeTaskResponse>(
                `/private/task/move/${payload.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate : ( payload ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ],
                ( oldData : TTaskSectionWithTasks[] ) => {

                    let task : TTaskForCardView | undefined;

                    const newData = produce( oldData, draft => {

                        for ( const taskSection of draft ) {
                            const taskIndex = taskSection.tasks.findIndex( task => task.task_id === payload.task_id )
                            if ( taskIndex !== -1 ) {
                                task = taskSection.tasks.splice( taskIndex, 1 )[0]
                                if ( task ) break
                            }
                        }

                        draft.map( taskSection => {
    
                            if ( task && taskSection.task_section_id === payload.body.task_section_id ) {
                                task.task_section_id = payload.body.task_section_id
                                task.display_order = payload.body.display_order
                                taskSection.tasks.push( task )
                            }
    
                            return taskSection
    
                        } )

                    } )



                    return newData
                }
            )
        }
    })
}

export const useUpdateTaskPrimitiveFields = () => {
    const {
        selectedTask
    } = useGlobalsStore()
    return useMutation<TTask, Error, TUpdateTaskPrimitiveFieldsPayload>({
        mutationFn : async ( payload : TUpdateTaskPrimitiveFieldsPayload ) => {
            const response = await axiosInstance.patch<TTask>(
                `/private/task/primitive-fields/${payload.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate : ( payload ) => {
            // Update the selected task from globals store
            updateGlobalsStore({
                selectedTask : {
                    ...selectedTask!,
                    task_title : payload.body.task_title || selectedTask!.task_title,
                    task_description : payload.body.task_description || selectedTask!.task_description
                }
            })
        },
        // onSuccess : ( _, variables ) => {
        //     queryClient.invalidateQueries({
        //         queryKey : [ ...QueryKeys.GET_TASK.split, variables.task_id ]
        //     })
        // }
    })
}

export const useAddTaskAssignee = () => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TAddTaskAssigneePayload>({
        mutationFn : async ( payload : TAddTaskAssigneePayload ) => {
            const response = await axiosInstance.post(
                `/private/task/assignee/${payload.task_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( _, variables ) => {
            if ( variables.optimisticData !== undefined ) {
                queryClient.setQueryData(
                    [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ],
                    ( oldData : TGetTaskboardSectionsResponse ) => produce( oldData, draft => {
                        draft.forEach( section => {
                            if ( "tasks" in section ) {
                                section.tasks.forEach( task => {
                                    if ( task.task_id === variables.task_id ) {
                                        task.assignees = [ ...task.assignees, variables.optimisticData! ]
                                    }
                                } )
                            }
                        } )
                    } )
                )
            }
        }
    })
}

export const useRemoveTaskAssignee = () => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TRemoveTaskAssigneePayload>({
        mutationFn : async ( payload : TRemoveTaskAssigneePayload ) => {
            const response = await axiosInstance.delete(
                `/private/task/assignee/${payload.task_id}`,
                {
                    data : payload.body
                }

            )
            return response.data
        },
        onSuccess : ( _, variables ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => {
                    const newData = produce( oldData, draft => {
                        draft.forEach( section => {
                            if ( "tasks" in section ) {
                                section.tasks.forEach( task => {
                                    if ( task.task_id === variables.task_id ) {
                                        task.assignees = task.assignees.filter( assignee => assignee.user_id !== variables.body.user_id )
                                    }
                                } )
                            }
                        } )
                    } )
                    return [...newData]
                }
            )
        }
    })
}

export const useAddTaskTimeLog = (
    onSuccess? : ( data : TAddTaskTimeLogResponse ) => void
) => {

    return useMutation<TAddTaskTimeLogResponse, Error, TAddTaskTimeLogPayload>({
        mutationFn : async ( payload : TAddTaskTimeLogPayload ) => {
            const response = await axiosInstance.post<TAddTaskTimeLogResponse>(
                `/private/task/log-time/${payload.task_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data ) => {
            onSuccess?.( data )
        }
    })
}

export const useAddTaskTag = (
    onSuccess? : ( data : TAddTaskTagResponse ) => void
) => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<TAddTaskTagResponse, Error, TAddTaskTagPayload>({
        mutationFn : async ( payload : TAddTaskTagPayload) => {
            const response = await axiosInstance.post<TAddTaskTagResponse>(
                `/private/task/tag`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => {
                    return produce( oldData, draft => {
                        draft.forEach( section => {
                            if ( "tasks" in section ) {
                                section.tasks.forEach( task => {
                                    if ( task.task_id === variables.body.task_id ) {
                                        task.tags = [ ...task.tags, data ]
                                    }
                                } )
                            }
                        } )
                    } )
                }
            )
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASK.split, variables.body.task_id ],
                ( oldData : TGetTaskResponse ) => {
                    return produce( oldData, draft => {
                        draft.tags = [ ...draft.tags, data ]
                    } )
                }
            )
            onSuccess?.( data )
        }
    })

}

export const useRemoveTaskTag = (
    onSuccess? : () => void
) => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TRemoveTaskTagPayload>({
        mutationFn : async ( payload : TRemoveTaskTagPayload ) => {
            const response = await axiosInstance.delete<any>(
                `/private/task/tag`,
                {
                    data : payload.body
                }
            )
            return response.data
        },
        onSuccess : ( _, variables ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => produce( oldData, draft => {
                    draft.forEach( section => {
                        if ( "tasks" in section ) {
                            section.tasks.forEach( task => {
                                if ( task.task_id === variables.body.task_id ) {
                                    task.tags = task.tags.filter( tag => tag.tag_id !== variables.body.tag_id )
                                }
                            } )
                        }
                    } )
                } )
            )
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASK.split, variables.body.task_id ],
                ( oldData : TGetTaskResponse ) => {
                    return produce( oldData, draft => {
                        draft.tags = draft.tags.filter( tag => tag.tag_id !== variables.body.tag_id )
                    } )
                }
            )
            onSuccess?.()
        }
    })

}

export const useAddTaskComment = (
    {
        onSuccess
    } : {
        onSuccess? : ( data : TAddTaskCommentResponseData ) => void
    } = {}
) => {

    const queryClient = useQueryClient()

    return useMutation<TAddTaskCommentResponseData, Error, TAddTaskCommentPayload>({
        mutationFn : async ( payload : TAddTaskCommentPayload ) => {
            const response = await axiosInstance.post<TAddTaskCommentResponseData>(
                `/private/task/comment/${payload.pathParameter.task_id}`,
                payload.body
            )
            return response.data
        },
        onSuccess : ( data, variables ) => {
            queryClient.setQueryData(
                [ ...QueryKeys.GET_TASK_COMMENTS.split, variables.pathParameter.task_id ],
                ( oldData : TGetTaskCommentsResponse ) => produce( oldData, draft => {
                    draft.push( data )
                } )
            )
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASK_COMMENTS.split, variables.pathParameter.task_id ]
            })
            onSuccess?.(data)
        }
    })

}

type TUseMoveTaskToTrashOptions = UseMutationOptions<any, Error, TMoveTaskToTrashPayload>

export const useMoveTaskToTrash = ( options? : TUseMoveTaskToTrashOptions ) => {

    const {
        selectedWorkspace,
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TMoveTaskToTrashPayload>({
        mutationFn : async ( payload : TMoveTaskToTrashPayload ) => {
            const response = await axiosInstance.delete<any>(
                `/private/task/trash/${payload.params.task_id}`
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            options?.onSuccess?.( data, variables, context )
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, false ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ]
            })
        }

    })

}

type TUseRestoreTaskFromTrashOptions = UseMutationOptions<any, Error, TRestoreTaskFromTrashPayload>

export const useRestoreTaskFromTrash = ( options? : TUseRestoreTaskFromTrashOptions ) => {

    const {
        selectedWorkspace,
        selectedTaskboard
    } = useGlobalsStore()

    const queryClient = useQueryClient()

    return useMutation<any, Error, TRestoreTaskFromTrashPayload>({
        mutationFn : async ( payload : TRestoreTaskFromTrashPayload ) => {
            const response = await axiosInstance.patch<any>(
                `/private/task/restore-from-trash/${payload.params.task_id}/${payload.params.taskboard_id}`
            )
            return response.data
        },
        onSuccess : ( data, variables, context ) => {
            options?.onSuccess?.( data, variables, context )
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_TRASH_TASKS.split, selectedTaskboard?.task_board_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, true ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard?.task_board_id, false ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ]
            })
        }
    })

}
