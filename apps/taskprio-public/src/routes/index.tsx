import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div
      className={cn(
        "w-screen h-screen",
        "flex justify-center items-center"
      )}
    >
      <h1>Welcome to Taskprio</h1>
    </div>
  )
}
