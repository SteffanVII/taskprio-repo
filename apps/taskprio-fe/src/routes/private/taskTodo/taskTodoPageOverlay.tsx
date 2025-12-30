import OverlaySettingsDialog from "@/components/others/dialogs/taskboardTaskDialog/overlaySettingsDialog/OverlaySettingsDialog";
import FocusMode_TaskTodoPageOverlay from "@/components/others/taskTodo/overlay/FocusMode_TaskTodoPageOverlay";
import Header_TaskTodoPageOverlay from "@/components/others/taskTodo/overlay/Header_TaskTodoPageOverlay";
import TodoList_TaskTodoPageOverlay from "@/components/others/taskTodo/overlay/TodoList_TaskTodoPageOverlay";
import { cn } from "@/lib/utils";
import { ETaskTodoPageUIMode, useTaskTodoPageStore_uIMode } from "@/stores/taskTodoPage";

const TaskTodoPageOverlay = () => {

    const uIMode = useTaskTodoPageStore_uIMode()

    return (
        <div
            className={cn(
                `group`,
                ` size-full min-w-0 min-h-0 rounded-lg overflow-hidden `,
                ` grid bg-background `,
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            {
                uIMode === ETaskTodoPageUIMode.OVERLAY &&
                <>
                    <Header_TaskTodoPageOverlay/>
                    <TodoList_TaskTodoPageOverlay/>
                </>
            }
            {
                uIMode === ETaskTodoPageUIMode.WIDGET &&
                <FocusMode_TaskTodoPageOverlay/>
            }
            <OverlaySettingsDialog/>
        </div>
    )

}

export default TaskTodoPageOverlay;