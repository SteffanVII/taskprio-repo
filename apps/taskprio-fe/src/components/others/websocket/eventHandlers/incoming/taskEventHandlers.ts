import useLatest from "@/lib/hooks/useLates";
import { QueryKeys } from "@/services/enum";
import { TGetTaskboardSectionsResponse } from "@/services/private/tasksection/types";
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard";

import { TTask, TTaskArrangedWebSocketMessage, TTaskAssigneeAddedWebSocketMessage, TTaskAssigneeRemovedWebSocketMessage, TTaskCreateWebSocketMessage, TTaskForCardView, TTaskSectionWithTasks, TTaskTagAddedWebSocketMessage, TTaskTagRemovedWebSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";

export const useTaskEventHandlers = () => {

    const queryClient = useQueryClient()

    const selectedTaskboardState = useTaskboardStore_selectedTaskboard()

    const selectedTaskboard = useLatest(selectedTaskboardState)

    const taskCreatedWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskCreateWebSocketMessage>
    ) => {
        if (message.message.data.task_board_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => produce(oldData, draft => {
                    draft.forEach(section => {
                        if (section.task_section_id === message.message.data.task_section_id) {
                            (section as TTaskSectionWithTasks).tasks.push(message.message.data)
                        }
                    })
                })
            )
        }
    }

    const taskUpdateWebSocketMessageHandler = (
        message: TWebSocketMessage<TTask>
    ) => {
        queryClient.setQueryData(
            ["get_taskboard_sections", selectedTaskboard.current?.task_board_id, true],
            (oldData: TGetTaskboardSectionsResponse) => produce(oldData, draft => {
                draft.forEach(section => {
                    if (section.task_section_id === message.message.task_section_id) {
                        (section as TTaskSectionWithTasks).tasks = (section as TTaskSectionWithTasks).tasks.map(task => {
                            if (task.task_id === message.message.task_id) {
                                return {
                                    ...message.message,
                                    assignees: task.assignees
                                }
                            }
                            return task
                        })
                    }
                })
            })
        )
    }

    const taskArrangedWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskArrangedWebSocketMessage>
    ) => {
        if (message.message.taskboard_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => {

                    if (oldData) {
                        return produce(oldData, draft => {
                            let targetTask: TTaskForCardView | undefined;
                            let targetTaskSection: TTaskSectionWithTasks | undefined;

                            for (const taskSection of draft) {

                                // Target section found
                                if (taskSection.task_section_id === message.message.data.task_section_id) {
                                    targetTaskSection = taskSection
                                }

                                // Find task in the current section if the target task is undefined
                                if (targetTask === undefined) {
                                    const taskIndex = taskSection.tasks.findIndex(task => task.task_id === message.message.data.task_id)
                                    // Task found in the current section
                                    if (taskIndex !== -1) {
                                        // If the target section if already found
                                        if (targetTaskSection) {
                                            // And the target task is in the same section. Only update the display order of the task
                                            if (targetTaskSection.task_section_id === taskSection.tasks[taskIndex].task_section_id) {
                                                taskSection.tasks[taskIndex].display_order = message.message.data.display_order
                                                break
                                                // If the target task is in a different section. Move the task to the target section
                                            } else {
                                                targetTask = taskSection.tasks.splice(taskIndex, 1)[0]
                                                targetTask.task_section_id = message.message.data.task_section_id
                                                targetTask.display_order = message.message.data.display_order
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
                                    targetTask.task_section_id = message.message.data.task_section_id
                                    targetTask.display_order = message.message.data.display_order
                                    targetTaskSection.tasks.push(targetTask)
                                    break;
                                }

                            }
                        })
                    }

                }
            )
        }
    }

    const taskAssigneeAddedWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskAssigneeAddedWebSocketMessage>
    ) => {
        if (message.message.taskboard_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => {
                    if (oldData) {
                        return produce(oldData, draft => {
                            for (const section of draft) {
                                const foundTask = section.tasks.find(task => task.task_id === message.message.task_id)
                                if (foundTask) {
                                    foundTask.assignees.push(message.message.data)
                                    break;
                                }
                            }
                        })
                    }
                    return oldData
                }
            )
        }
    }

    const taskAssigneeRemoveWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskAssigneeRemovedWebSocketMessage>
    ) => {
        if (message.message.taskboard_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => {
                    if (oldData) {
                        return produce(oldData, draft => {
                            for (const section of draft) {
                                const foundTask = section.tasks.find(task => task.task_id === message.message.task_id)
                                if (foundTask) {
                                    foundTask.assignees = foundTask.assignees.filter(assignee => assignee.user_id !== message.message.data)
                                    break;
                                }
                            }
                        })
                    }
                    return oldData
                }
            )
        }
    }

    const taskTagAddedWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskTagAddedWebSocketMessage>
    ) => {
        if (message.message.taskboard_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => {
                    if (oldData) {
                        return produce(oldData, draft => {
                            for (const section of draft) {
                                const foundTask = section.tasks.find(task => task.task_id === message.message.task_id)
                                if (foundTask) {
                                    foundTask.tags.push(message.message.data)
                                    break;
                                }
                            }
                        })
                    }
                    return oldData
                }
            )
        }
    }

    const taskTagRemovedWebSocketMessageHandler = (
        message: TWebSocketMessage<TTaskTagRemovedWebSocketMessage>
    ) => {
        if (message.message.taskboard_id === selectedTaskboard.current?.task_board_id) {
            queryClient.setQueryData(
                [...QueryKeys.GET_TASKBOARD_SECTIONS.split, selectedTaskboard.current?.task_board_id, true],
                (oldData: TTaskSectionWithTasks[]) => {
                    if (oldData) {
                        return produce(oldData, draft => {
                            for (const section of draft) {
                                const foundTask = section.tasks.find(task => task.task_id === message.message.task_id)
                                if (foundTask) {
                                    foundTask.tags = foundTask.tags.filter(tag => tag.tag_id !== message.message.data)
                                    break;
                                }
                            }
                        })
                    }
                    return oldData
                }
            )
        }
    }


    return {
        taskCreatedWebSocketMessageHandler,
        taskUpdateWebSocketMessageHandler,
        taskArrangedWebSocketMessageHandler,
        taskAssigneeAddedWebSocketMessageHandler,
        taskAssigneeRemoveWebSocketMessageHandler,
        taskTagAddedWebSocketMessageHandler,
        taskTagRemovedWebSocketMessageHandler
    }

}