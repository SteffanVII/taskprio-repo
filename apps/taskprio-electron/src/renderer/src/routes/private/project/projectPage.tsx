import TaskboardList from "@/components/others/taskboard/TaskboardList";
import { cn } from "@/lib/utils";
import { useTaskboardStore_noTaskboards } from "@/stores/taskboard";
import { Outlet } from "react-router";

const ProjectPage = () => {

  const noTaskboards = useTaskboardStore_noTaskboards()

  return (
    <div
      className={cn(
        `relative`,
        `size-full min-w-0 min-h-0 max-h-full max-w-full overflow-hidden`,
        `grow`
      )}
    >
      {
        !noTaskboards &&
        <TaskboardList />
      }
      <Outlet />
    </div>
  )

}

export default ProjectPage;