import { TGetTaskboardSectionsResponse } from "@/services/private/tasksection/types";
import { useGlobalsStore_selectedTaskboard } from "@/stores/globals";

import { TTask, TTaskSectionWithTasks, TWebSocketMessage } from "@repo/taskprio-types/src";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback } from "react";

export const useTaskEventHandlers = () => {

    const queryClient = useQueryClient()

    const selectedTaskboard = useGlobalsStore_selectedTaskboard()

    const taskUpdateWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TTask> ) => {
        queryClient.setQueryData(
            [ "get_taskboard_sections", selectedTaskboard?.task_board_id, true ],
            ( oldData : TGetTaskboardSectionsResponse ) => produce( oldData, draft => {
                draft.forEach( section => {
                    if ( section.task_section_id === message.data.task_section_id ) {
                        (section as TTaskSectionWithTasks).tasks = (section as TTaskSectionWithTasks).tasks.map( task => {
                            if ( task.task_id === message.data.task_id ) {
                                return {
                                    ...message.data,
                                    assignees : task.assignees
                                }
                            }
                            return task
                        } )
                    }
                } )
            } )
        )
    }, [queryClient, selectedTaskboard])

    return {
        taskUpdateWebSocketMessageHandler
    }

}