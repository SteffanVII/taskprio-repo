import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { createFileRoute, redirect } from '@tanstack/react-router'

type TAcceptSearch = {
  token: string
}

export const Route = createFileRoute('/accept')({
  validateSearch : (search : Record<string, string>) : TAcceptSearch => {
    return {
      token: search.token
    }
  },
  beforeLoad: async ({ search }) => {
    if (!search.token) {
      throw redirect({ to : "/" })
    }
    const response = await fetch(`${import.meta.env.VITE_TASKPRIO_SERVICE_URL}/invitation/workspace/accept/${search.token}`, {
      method : "POST"
    })
    const data = await response.json()
    return { response, data }
  },
  pendingComponent : PendingComponent,
  component: RouteComponent,
})

function PendingComponent() {

  return (
    <div
      className={cn(
        "w-screen h-screen",
        "flex flex-col justify-center items-center",
        "bg-muted"
      )}
    >
      <p className={cn("text-lg font-bold")} >Taskprio</p>
      <h2 className={cn("text-2xl font-bold py-8")} >Workspace Invitation</h2>
      <p>Accepting Invitation ...</p>
      <p>Please wait while we process your invitation.</p>
      <Spinner className='size-[4rem] mt-8' />
    </div>
  )

}

function RouteComponent() {

  const { response } = Route.useRouteContext()

  return (
    <div
      className={cn(
        "w-screen h-screen",
        "flex flex-col justify-center items-center",
        "bg-muted"
      )}
    >
      <p className={cn("text-lg font-bold")} >Taskprio</p>
      <h2 className={cn("text-2xl font-bold py-8")} >Workspace Invitation</h2>
      {
        response.status === 200 ? (
          <>
            <p className="text-green-500 text-lg" >Invitation Accepted!</p>
            <p>You have successfully joined the workspace. Your boards, team tasks, and real-time trackers are now synced to your profile.</p>
          </>
        ) : (
          <>
            <p className="text-red-500 text-lg" >Verification Failed</p>
            <p>This invitation link is invalid, expired, or has already been used. Please request a new invite from your team administrator.</p>
          </>
        )
      }
    </div>
  )
}