import { createFileRoute } from '@tanstack/react-router'
import WorkspaceSettingsPage from './-components/workspaceSettingsPage'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/workspaceSettings/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <WorkspaceSettingsPage/>
  )
}
