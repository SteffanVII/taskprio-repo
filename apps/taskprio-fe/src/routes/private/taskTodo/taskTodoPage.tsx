import AvailableTasksSection_TaskTodoPage from "@/components/others/taskTodo/availableTasksSection/AvailableTasksSection_TaskTodoPage";
import TaskList_TaskTodoPage from "@/components/others/taskTodo/taskList/TaskList_TaskTodoPage";
import TaskTodoPageHeader from "@/components/others/taskTodo/TaskTodoPageHeader";
import { cn } from "@/lib/utils";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { updateTaskTodoPageStore, useTaskTodoPageStore_taskTodoPageCompactMode } from "@/stores/taskTodoPage";
import { useEffect, useRef } from "react";


const TaskTodoPage = () => {

    const taskTodoPageRootRef = useRef<HTMLDivElement>(null)
    const resizeObserverRef = useRef<ResizeObserver>(null)

    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()
    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()

    useEffect(() => {
        resizeObserverRef.current = new ResizeObserver( entries => {
            for ( const entry of entries ) {
                const { width } = entry.contentRect
                if ( width <= 990 ) {
                    updateTaskTodoPageStore({
                        taskTodoPageCompactMode : true
                    })
                } else {
                    updateTaskTodoPageStore({
                        taskTodoPageCompactMode : false
                    })
                }
            }
        } )
        resizeObserverRef.current.observe( taskTodoPageRootRef.current! )
        return () => {
            if ( taskTodoPageRootRef.current )
            resizeObserverRef.current?.unobserve( taskTodoPageRootRef.current )
        }
    }, [])

    return (
        <div
            ref={taskTodoPageRootRef}
            className={cn(
                ` size-full min-w-0 min-h-0 overflow-hidden `,
                ` flex flex-col grow`
            )}
        >
            <TaskTodoPageHeader/>
            <div
                className={cn(
                    ` size-full min-w-0 min-h-0 overflow-hidden `,
                    ` grid grow`
                )}
                style={ (taskTodoPageShowAvailableTasks && !taskTodoPageCompactMode) ? {
                    gridTemplateColumns : "min-content 1fr"
                } : { gridTemplateColumns : "1fr" }}
            >
                <TaskList_TaskTodoPage/>
                {
                    (taskTodoPageShowAvailableTasks || taskTodoPageCompactMode) && 
                    <AvailableTasksSection_TaskTodoPage/>
                }
                {/* <AvailableTaskSectionsSheet/> */}
            </div>            
        </div>
    )

}

export default TaskTodoPage;