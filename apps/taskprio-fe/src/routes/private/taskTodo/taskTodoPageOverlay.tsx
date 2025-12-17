import Header_TaskTodoPageOverlay from "@/components/others/taskTodo/overlay/Header_TaskTodoPageOverlay";
import TodoList_TaskTodoPageOverlay from "@/components/others/taskTodo/overlay/TodoList_TaskTodoPageOverlay";
import { cn } from "@/lib/utils";

const TaskTodoPageOverlay = () => {

    return (
        <div
            className={cn(
                ` size-full min-w-0 min-h-0 rounded-lg overflow-hidden `,
                ` grid bg-background `,
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <Header_TaskTodoPageOverlay/>
            <TodoList_TaskTodoPageOverlay/>
        </div>
    )

}

export default TaskTodoPageOverlay;