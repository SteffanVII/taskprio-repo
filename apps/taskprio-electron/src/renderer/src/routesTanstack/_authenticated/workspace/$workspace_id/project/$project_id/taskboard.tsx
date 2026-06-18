import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/project/$project_id/taskboard'
)({
  component: RouteComponent
})

function RouteComponent() {
  return <Outlet/>
}
