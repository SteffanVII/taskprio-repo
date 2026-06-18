import Taskboard from '@/components/others/taskboard/Taskboard'
import { createFileRoute } from '@tanstack/react-router'
import TaskboardHeader from './-components/TaskboardHeader'

export const Route = createFileRoute(
  '/_authenticated/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <TaskboardHeader/>
      <Taskboard/>
    </>
  )
}
