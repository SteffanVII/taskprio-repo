import ProjectHeader from "@/components/others/project/ProjectHeader";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";

const ProjectPage = () => {

  return (
    <div
      className={cn(
        `relative`,
        `size-full min-w-0 min-h-0 max-h-full max-w-full overflow-hidden`,
        `grow`
      )}
    >
      <ProjectHeader/>
      <Outlet />
    </div>
  )

}

export default ProjectPage;