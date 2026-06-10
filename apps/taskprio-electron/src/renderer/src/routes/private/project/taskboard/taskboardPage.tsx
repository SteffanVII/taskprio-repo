import NoTaskboardsStage from "@/components/others/project/NoTaskboardsStage";
import Taskboard from "@/components/others/taskboard/Taskboard";
import { cn } from "@/lib/utils";
import { useTaskboardStore_noTaskboards } from "@/stores/taskboard";

const TaskboardPage = () => {

  const noTaskboards = useTaskboardStore_noTaskboards()

  return (
    <div
      className={cn(
        `relative size-full max-h-full min-h-0 overflow-hidden bg-background `,
        `flex grow`,
      )}
    >
      {
        noTaskboards ?
          <>
            <div></div>
            <NoTaskboardsStage />
          </>
          :
          <>
            <Taskboard />
          </>
      }
    </div>
  )

}

export default TaskboardPage;