import { createFileRoute } from '@tanstack/react-router'
import TaskboardsSection from './-components/TaskboardsSection'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/project/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <TaskboardsSection/>
    </div>
  )
}
