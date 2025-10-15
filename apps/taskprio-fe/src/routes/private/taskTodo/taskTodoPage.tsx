import AvailableTasksSection_TaskTodoPage from "@/components/others/taskTodo/AvailableTasksSection_TaskTodoPage";
import TaskList_TaskTodoPage from "@/components/others/taskTodo/TaskList_TaskTodoPage";
import { cn } from "@/lib/utils";
import { useGlobalsStore } from "@/stores/globals";

const TaskTodoPage = () => {

    const {
        taskTodoPageShowAvailableTasks
    } = useGlobalsStore()

    return (
        <div
            className={cn(
                ` size-full min-h-0 `,
                ` grid bg-accent `
            )}
            style={ taskTodoPageShowAvailableTasks ? {
                gridTemplateColumns : "min-content 1fr"
            } : {}}
        >
            <TaskList_TaskTodoPage/>
            {
                taskTodoPageShowAvailableTasks && 
                <AvailableTasksSection_TaskTodoPage/>
            }
        </div>
    )

}

export default TaskTodoPage;