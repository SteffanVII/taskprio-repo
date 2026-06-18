import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id/$task_id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return null
}
