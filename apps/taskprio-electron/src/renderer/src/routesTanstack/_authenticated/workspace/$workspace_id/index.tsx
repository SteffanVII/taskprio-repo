import { createFileRoute } from '@tanstack/react-router'
import ProjectPageSkeleton from './project/-components/ProjectPageSkeleton'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProjectPageSkeleton/>
}
