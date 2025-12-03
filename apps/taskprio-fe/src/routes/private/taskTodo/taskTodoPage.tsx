import AvailableTasksSection_TaskTodoPage from "@/components/others/taskTodo/availableTasksSection/AvailableTasksSection_TaskTodoPage";
import TaskList_TaskTodoPage from "@/components/others/taskTodo/taskList/TaskList_TaskTodoPage";
import TaskTodoPageHeader from "@/components/others/taskTodo/TaskTodoPageHeader";
import { cn } from "@/lib/utils";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";


const TaskTodoPage = () => {

    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()


    return (
        <div
            className={cn(
                ` size-full min-w-0 min-h-0 overflow-hidden `,
                ` flex flex-col`
            )}
        >
            <TaskTodoPageHeader/>
            <div
                className={cn(
                    ` size-full min-w-0 min-h-0 overflow-hidden `,
                    ` grid`
                )}
                style={ taskTodoPageShowAvailableTasks ? {
                    gridTemplateColumns : "min-content 1fr"
                } : { gridTemplateColumns : "1fr 0fr" }}
            >
                <TaskList_TaskTodoPage/>
                {
                    taskTodoPageShowAvailableTasks && 
                    <AvailableTasksSection_TaskTodoPage/>
                }
            </div>            
        </div>
    )

}

export default TaskTodoPage;