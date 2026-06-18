import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import getHexLuminance, { getTextColorByHexLuminance } from "@/lib/utils/hexColorLuminance";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { useProjectStore_selectedProject } from "@/stores/project";
import { useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";


const ProjectPageHeader = () => {

  const navigate = useNavigate()

  const selectedProject = useProjectStore_selectedProject()

  const handleProjectSettingsOnClick = () => {
    navigate({
      from: "/workspace/$workspace_id/project/$project_id/",
      to: "/workspace/$workspace_id/project/$project_id/projectSettings"
    })
  }

  return (
    <header
      className={cn(
        "flex items-center gap-8"
      )}
    >
      <div
        className={cn(
          "flex flex-col"
        )}
      >
        <h2
          className={cn(
            "text-2xl font-bold"
          )}
        >{selectedProject?.project_name}</h2>
        <div className={cn("flex gap-2")} >
          <Badge>Project</Badge>
          <Badge
            style={ selectedProject ? {
              backgroundColor: selectedProject.project_color,
              color: getTextColorByHexLuminance(selectedProject.project_color)
            } : undefined}
          >{selectedProject?.project_abbreviation}</Badge>
        </div>
      </div>
      <Button
        size={"icon-lg"}
        variant={"ghost"}
        onClick={handleProjectSettingsOnClick}
      ><Settings /></Button>
    </header>
  )

}

export default ProjectPageHeader;