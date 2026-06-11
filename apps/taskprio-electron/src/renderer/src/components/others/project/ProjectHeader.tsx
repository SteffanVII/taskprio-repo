import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import TaskboardList from "../taskboard/TaskboardList";
import useInProjectSettings from "@/lib/hooks/useInProjectSettings";

const ProjectHeader = () => {

  const inProjectSettings = useInProjectSettings()

  if (inProjectSettings) return null

  return (
    <header
      className={cn(
        `flex justify-between items-center`,
        `p-2`,
        `bg-muted border-b border-border`
      )}
    >
      <TaskboardList/>
      <Button variant={"ghost"} size={"icon"} ><Settings/></Button>
    </header>
  )

}

export default ProjectHeader;