import { createFileRoute } from "@tanstack/react-router";
import TaskboardsSection from "../-components/TaskboardsSection";
import { cn } from "@/lib/utils";
import ProjectPageHeader from "../-components/ProjectPageHeader";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { useGetUserWorkspaces } from "@/services/private/workspace/query";
import ProjectPageSkeleton from "../-components/ProjectPageSkeleton";

export const Route = createFileRoute("/_authenticated/workspace/$workspace_id/project/$project_id/")({
  component: RouteComponent
})

function RouteComponent() {

  const {
    isLoading : workspacesIsLoading
  } = useGetUserWorkspaces()

  const {
    isLoading : projectsIsLoading
  } = useGetUserProjectsByWorkspace()

  const showSkeleton = workspacesIsLoading || projectsIsLoading;

  if (showSkeleton) return <ProjectPageSkeleton/>

  return (
    <div
      className={cn("h-full p-8 space-y-8 bg-muted")}
    >
      <ProjectPageHeader/>
      <TaskboardsSection/>
    </div>
  )
}