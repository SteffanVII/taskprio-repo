import NoTaskboardsStage from "@/components/others/project/NoTaskboardsStage";
import Taskboard from "@/components/others/taskboard/Taskboard";
import TaskboardList from "@/components/others/taskboard/TaskboardList";
import { cn } from "@/lib/utils";
import { useGlobalsStore_noTaskboards } from "@/stores/globals";

const TaskboardPage = () => {    

    const noTaskboards = useGlobalsStore_noTaskboards()

    return (
        <div
            className={cn(
                `relative size-full max-h-full min-h-0 overflow-hidden bg-background `,
                `flex flex-col grow `
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            {
                noTaskboards ?
                <>
                    <div></div>
                    <NoTaskboardsStage/>
                </>
                :
                <>
                    <TaskboardList/>
                    <Taskboard/>
                </>
            }
        </div>
    )

}

export default TaskboardPage;