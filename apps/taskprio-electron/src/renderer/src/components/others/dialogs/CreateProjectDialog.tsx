import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/services/private/project/mutation";
import { useDialogsStore, useDialogsStore_createProjectDialog } from "@/stores/dialogs";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import Spinner from "../Spinner";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";
import { taskSectionColors } from "@/lib/utils/shared";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  projectName: z.string().min(1, "Project Name is required"),
  projectCode: z.string().optional(),
  projectColor: z.string().optional()
})

const CreateProjectDialog = () => {

  const {
    open
  } = useDialogsStore_createProjectDialog()

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const setCreateProjectDialog = useDialogsStore(state => state.setCreateProjectDialog)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectCode: "",
      projectColor: ""
    }
  })

  const {
    mutateAsync: createProject,
    isPending: isCreatingProject
  } = useCreateProject(() => {
    setCreateProjectDialog(false)
    form.reset()
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedWorkspace) return
    await createProject({
      body: {
        project_name: values.projectName,
        workspace_id: selectedWorkspace.workspace_id,
        project_color: values.projectColor,
        project_abbreviation: values.projectCode
      }
    })
  }

  useEffect(() => {
    if (open) {
      form.reset()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => {
      setCreateProjectDialog(!open)
    }}>
      <DialogContent>
        <DialogTitle>Create Project</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" >
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                      disabled={isCreatingProject}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Code (Optional)"
                      {...field}
                      disabled={isCreatingProject}
                    />
                  </FormControl>
                  <FormDescription>
                    This code will be used as a prefix for tasks. You can update this later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectColor"
              render={({ field }) => (
                <FormItem className="gap-4" >
                  <FormLabel>Project Color (Optional)</FormLabel>
                  <div
                    className={cn(
                      `flex gap-2 flex-wrap`
                    )}
                  >
                    {
                      taskSectionColors.map(color => (
                        <button
                          type="button"
                          key={color}
                          className={cn(
                            `size-[2rem] border rounded-md cursor-pointer transition-all`,
                            `hover:shadow-lg hover:-translate-y-[0.2rem]`,
                            field.value === color && `outline-primary outline-2`
                          )}
                          style={{
                            backgroundColor: color
                          }}
                          onClick={() => field.onChange(color)}
                        ></button>
                      ))
                    }
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant={"outline"}
                type="submit"
                disabled={isCreatingProject}
              >
                {isCreatingProject ? <Spinner /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

}

export default CreateProjectDialog;