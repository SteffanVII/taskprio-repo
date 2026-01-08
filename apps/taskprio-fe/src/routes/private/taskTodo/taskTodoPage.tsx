import AvailableTasksSection_TaskTodoPage from "@/components/others/taskTodo/availableTasksSection/AvailableTasksSection_TaskTodoPage";
import TaskCard from "@/components/others/taskTodo/taskList/TaskCard_TaskTodoPage";
import AvailableTaskCard from "@/components/others/taskTodo/availableTasksSection/AvailableTasksSectionTaskCard_TaskTodoPage"
import TaskList_TaskTodoPage from "@/components/others/taskTodo/taskList/TaskList_TaskTodoPage";
import { cn } from "@/lib/utils";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { ETaskTodoPageDragType, updateTaskboardDragStore, useTaskboardDragStore_taskboardTaskTodoDrag } from "@/stores/taskboardDrag";
import { updateTaskTodoPageStore, useTaskTodoPageStore_taskTodoPageCompactMode } from "@/stores/taskTodoPage";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { TUserAvailableTaskTodo, TUserTaskTodoState } from "@repo/taskprio-types/src";
import { useEffect, useRef } from "react";
import { useMoveTaskToTodo, useUpdateTaskTodoState } from "@/services/private/todo/mutation";

const TaskTodoPage = () => {

    const taskTodoPageRootRef = useRef<HTMLDivElement>(null)
    const resizeObserverRef = useRef<ResizeObserver>(null)

    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()
    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()
    const taskTodoPageTaskDrag = useTaskboardDragStore_taskboardTaskTodoDrag()

    const {
        mutateAsync : moveTaskToTodoTrigger
    } = useMoveTaskToTodo()

    const {
        mutateAsync : updateTaskTodoStateTrigger
    } = useUpdateTaskTodoState()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    )

    const onDndContextDragStartHandler = (e: DragStartEvent) => {
        if (e.active.data.current) {
            updateTaskboardDragStore({
                taskboardTaskTodoDrag: {
                    taskboardTaskTodo: e.active.data.current.data,
                    type: e.active.data.current.type as ETaskTodoPageDragType
                }
            })
        }
    }

    const onDndContextDragEndHandler = (e: DragEndEvent) => {

        if (e.over?.data.current && e.active.data.current) {
            const displayOrder = e.over.data.current.displayOrder
            if ( taskTodoPageTaskDrag.type === ETaskTodoPageDragType.AVAILABLE ) {
                const availableTask = e.active.data.current.data as TUserAvailableTaskTodo
                moveTaskToTodoTrigger({
                    pathParameters : {
                        task_id : availableTask.task_id
                    },
                    body : {
                        display_order : displayOrder
                    },
                    optimisticHelpers : {
                        task : availableTask
                    }
                })
            } else {
                const todoTask = e.active.data.current.data as TUserTaskTodoState
                updateTaskTodoStateTrigger({
                    pathParameters : {
                        task_id : todoTask.task_id
                    },
                    body : {
                        display_order : displayOrder,
                        active : true
                    }
                })
            }
        }

        updateTaskboardDragStore({
            taskboardTaskTodoDrag: {
                taskboardTaskTodo: null,
                type: ETaskTodoPageDragType.TODO
            }
        })
    }

    useEffect(() => {
        resizeObserverRef.current = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width } = entry.contentRect
                if (width <= 990) {
                    updateTaskTodoPageStore({
                        taskTodoPageCompactMode: true
                    })
                } else {
                    updateTaskTodoPageStore({
                        taskTodoPageCompactMode: false
                    })
                }
            }
        })
        resizeObserverRef.current.observe(taskTodoPageRootRef.current!)
        return () => {
            if (taskTodoPageRootRef.current)
                resizeObserverRef.current?.unobserve(taskTodoPageRootRef.current)
        }
    }, [])

    return (
        <div
            ref={taskTodoPageRootRef}
            className={cn(
                `size-full min-w-0 min-h-0 overflow-hidden `,
                `flex flex-col grow`,
                `bg-background`
            )}
        >
            <div
                className={cn(
                    ` size-full min-w-0 min-h-0 overflow-hidden `,
                    ` grid grow`
                )}
                style={(taskTodoPageShowAvailableTasks && !taskTodoPageCompactMode) ? {
                    gridTemplateColumns: "min-content 1fr"
                } : { gridTemplateColumns: "1fr" }}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={rectIntersection}
                    onDragStart={onDndContextDragStartHandler}
                    onDragEnd={onDndContextDragEndHandler}
                >
                    <DragOverlay
                        dropAnimation={null}
                    >
                        {
                            taskTodoPageTaskDrag.taskboardTaskTodo && (
                                taskTodoPageTaskDrag.type === ETaskTodoPageDragType.TODO ?
                                    <TaskCard
                                        data={{
                                            ...taskTodoPageTaskDrag.taskboardTaskTodo,
                                            display_order: 0,
                                            active: false,
                                            completed: false,
                                            current_work_time: "0",
                                            work_time_goal: "0",
                                            timers: []
                                        }}
                                        preview
                                    />
                                    :
                                    <AvailableTaskCard
                                        data={taskTodoPageTaskDrag.taskboardTaskTodo}
                                        preview
                                    />
                            )
                        }
                    </DragOverlay>
                    <TaskList_TaskTodoPage />
                    {
                        (taskTodoPageShowAvailableTasks || taskTodoPageCompactMode) &&
                        <AvailableTasksSection_TaskTodoPage />
                    }
                </DndContext>
            </div>
        </div>
    )

}

export default TaskTodoPage;