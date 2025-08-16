import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TAddTaskAssigneePayload, TAddTaskTimeLogPayload, TAddTaskTimeLogResponse, TArrangeTaskPayload, TArrangeTaskResponse, TCreateTaskPayload, TCreateTaskResponse, TRemoveTaskAssigneePayload, TUpdateTaskPrimitiveFieldsPayload } from "./types"
import { axiosInstance } from "@/services/axios"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { TTask, TTaskForCardView, TTaskSectionWithTasks } from "@repo/taskprio-types/src/index"
import { TGetTaskboardSectionsResponse } from "../tasksection/types"
import { produce } from "immer"

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
                [ "get_taskboard_sections", payload.body.task_board_id, true ],
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
                `/private/task/${payload.task_id}`,
                payload.body
            )
            return response.data
        },
        onMutate : ( payload ) => {
            queryClient.setQueryData(
                [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true ],
                ( oldData : TTaskSectionWithTasks[] ) => {

                    let task : TTaskForCardView | undefined;

                    for ( const taskSection of oldData ) {
                        const taskIndex = taskSection.tasks.findIndex( task => task.task_id === payload.task_id )
                        if ( taskIndex !== -1 ) {
                            task = taskSection.tasks.splice( taskIndex, 1 )[0]
                            if ( task ) break
                        }
                    }

                    return oldData.map( taskSection => {

                        if ( task && taskSection.task_section_id === payload.body.task_section_id ) {
                            task.task_section_id = payload.body.task_section_id
                            task.display_order = payload.body.display_order
                            taskSection.tasks.push( task )
                        }

                        return taskSection

                    } )
                }
            )
        }
    })
}

export const useUpdateTaskPrimitiveFields = () => {
    const queryClient = useQueryClient()
    const {
        selectedTaskboard,
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
            // Update the task inside the taskboard sections
            queryClient.setQueryData(
                [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true],
                ( oldData : TTaskSectionWithTasks[] ) => {
                    if ( !oldData ) return oldData
                    return oldData.map( taskSection => {
                        return {
                            ...taskSection,
                            tasks : taskSection.tasks.map( task => {
                                if ( task.task_id === payload.task_id ) {
                                    return {
                                        ...task,
                                        task_title : payload.body.task_title || task.task_title,
                                        task_description : payload.body.task_description || task.task_description
                                    }
                                }
                                return task
                            } )
                        }
                    } )
                }
            )
            // Update the selected task from globals store
            updateGlobalsStore({
                selectedTask : {
                    ...selectedTask!,
                    task_title : payload.body.task_title || selectedTask!.task_title,
                    task_description : payload.body.task_description || selectedTask!.task_description
                }
            })
        }
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
        onSuccess : ( data, variables ) => {
            queryClient.setQueryData(
                [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true ],
                ( oldData : TGetTaskboardSectionsResponse ) => produce( oldData, draft => {
                    draft.forEach( section => {
                        (section as TTaskSectionWithTasks).tasks.forEach( task => {
                            if ( task.task_id === variables.task_id ) {
                                
                            }
                        } )
                    } )
                } )
            )
        }
    })
}

export const useRemoveTaskAssignee = () => {
    return useMutation<any, Error, TRemoveTaskAssigneePayload>({
        mutationFn : async ( payload : TRemoveTaskAssigneePayload ) => {
            const response = await axiosInstance.delete(
                `/private/task/assignee/${payload.task_id}`,
                {
                    data : payload.body
                }

            )
            return response.data
        }
    })
}

export const useAddTaskTimeLog = (
    onSuccess? : ( data : TAddTaskTimeLogResponse) => void
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