import Taskboard from "@/components/others/taskboard/Taskboard";
import TaskboardList from "@/components/others/taskboard/TaskboardList";
import { cn } from "@/lib/utils";

const TaskboardPage = () => {

    return (
        <div
            className={cn(
                ` size-full `,
                ` flex flex-col grow `
            )}
        >
            <TaskboardList/>
            <Taskboard/>
        </div>
    )

}

export default TaskboardPage;