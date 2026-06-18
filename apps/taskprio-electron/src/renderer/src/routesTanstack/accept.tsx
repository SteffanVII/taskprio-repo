import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accept')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accept"!</div>
}
