import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/workspace/$workspace_id')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <Outlet/>
}
