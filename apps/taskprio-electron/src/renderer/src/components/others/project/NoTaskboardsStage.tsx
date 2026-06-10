import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateTaskboard } from "@/services/private/taskboard/mutation"
import { updateTaskboardStore } from "@/stores/taskboard"
import { useProjectStore_selectedProject } from "@/stores/project"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useNavigate } from "react-router"
import Spinner from "../Spinner"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FolderClosed } from "lucide-react"

const createTaskboardFormSchema = z.object({
  taskboard_name: z.string().min(1, "Taskboard name is required")
})

const NoTaskboardsStage = () => {

  const navigate = useNavigate()

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const selectedProject = useProjectStore_selectedProject()

  const {
    mutateAsync: createTaskboardTrigger,
    isPending: createTaskboardIsPending
  } = useCreateTaskboard({
    onSuccess: (data) => {
      if (!selectedWorkspace) return
      updateTaskboardStore({
        noTaskboards: false
      })
      navigate(`/p/w/${selectedWorkspace.workspace_id}/d/${data.project_id}/t/${data.task_board_id}`)
    }
  })

  const form = useForm<z.infer<typeof createTaskboardFormSchema>>({
    resolver: zodResolver(createTaskboardFormSchema),
    defaultValues: {
      taskboard_name: ""
    }
  })

  const onSubmitCreateTaskboard = (data: z.infer<typeof createTaskboardFormSchema>) => {
    if (!selectedProject) return
    createTaskboardTrigger({
      taskboard_name: data.taskboard_name,
      project_id: selectedProject.project_id
    })
  }

  return (
    <div
      className={` size-full flex items-center justify-center bg-background `}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia
            variant={"icon"}
          >
            <FolderClosed />
          </EmptyMedia>
          <EmptyTitle>No Taskboards Yet</EmptyTitle>
          <EmptyDescription>This project doesn't have any taskboards. Please create one.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Form
            {...form}
          >
            <form className="flex flex-col gap-4" >
              <div className="flex flex-col py-[2rem]" >
                <FormField
                  control={form.control}
                  name="taskboard_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          disabled={createTaskboardIsPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-left" >
                        This is your taskboard public display name.
                      </FormDescription>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                variant="outline"
                disabled={createTaskboardIsPending || createTaskboardIsPending}
                onClick={() => {
                  form.handleSubmit(onSubmitCreateTaskboard)()
                }}
              >
                {
                  createTaskboardIsPending ? <Spinner /> : "Create Taskboard"
                }
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  )

}

export default NoTaskboardsStage;