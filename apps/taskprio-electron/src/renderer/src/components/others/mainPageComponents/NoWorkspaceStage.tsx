import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateWorkspace } from "@/services/private/workspace/mutation"

import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useNavigate } from "@tanstack/react-router"
import Spinner from "../Spinner"
import { useSidebar } from "@/components/ui/sidebar"
import { FolderClosed, Menu } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

const formSchema = z.object({
  workspaceName: z.string().min(1, "Workspace Name is required")
})

const NoWorkspaceStage = () => {

  const navigate = useNavigate()
  const sidebar = useSidebar()

  const {
    mutateAsync: createWorkspace,
    isPending: isCreatingWorkspace,
  } = useCreateWorkspace()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceName: ""
    }
  })

  const onSubmitCreateWorkspace = async (values: z.infer<typeof formSchema>) => {
    const response = await createWorkspace({
      body: {
        workspace_name: values.workspaceName
      }
    })
    form.reset()
    navigate({
      to : "/workspace/$workspace_id",
      params : {
        workspace_id : response.workspace_id
      }
    })
  }

  return (
    <div
      className={cn(
        ` relative size-full max-w-screen max-h-screen `,
        ` flex items-center justify-center grow `,
        ` bg-background z-50 `
      )}
    >
      {
        // Show sidebar button when in mobile mode
        sidebar.isMobile &&
        <Button
          className={cn(
            `absolute top-4 left-4`
          )}
          variant={"ghost"}
          size={"icon"}
          onClick={() => {
            sidebar.toggleSidebar()
          }}
        ><Menu /></Button>
      }
      <Empty>
        <EmptyHeader>
          <EmptyMedia
            variant={"icon"}
          >
            <FolderClosed />
          </EmptyMedia>
          <EmptyTitle>No Workspaces Yet</EmptyTitle>
          <EmptyDescription>You're currently not a member of any workspace. Please create one or join a workspace.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreateWorkspace)} className="flex flex-col gap-4" >
              <div className="flex flex-col gap-4 py-[2rem]" >
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          {...field}
                          disabled={isCreatingWorkspace}
                        />
                      </FormControl>
                      <FormDescription className="text-left" >
                        This is your public display name.
                      </FormDescription>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                variant="outline"
                disabled={isCreatingWorkspace}
                type="submit"
              >
                {
                  isCreatingWorkspace ?
                    <Spinner size="sm" />
                    :
                    "Create workspace"
                }
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  )

}

export default NoWorkspaceStage;