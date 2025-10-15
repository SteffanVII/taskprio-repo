import Taskboard from "@/components/others/taskboard/Taskboard";
import TaskboardList from "@/components/others/taskboard/TaskboardList";
import { cn } from "@/lib/utils";

const TaskboardPage = () => {

    return (
        <div
            className={cn(
                `relative size-full max-h-full min-h-0 `,
                `grid grow `
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <TaskboardList/>
            <Taskboard/>
        </div>
    )

}

export default TaskboardPage;