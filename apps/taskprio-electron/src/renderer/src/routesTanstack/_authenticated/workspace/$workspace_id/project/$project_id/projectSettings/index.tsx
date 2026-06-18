import ProjectSettingsPage from '@/routes/private/project/settings/projectSettingsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/project/$project_id/projectSettings/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProjectSettingsPage/>
  )
}
