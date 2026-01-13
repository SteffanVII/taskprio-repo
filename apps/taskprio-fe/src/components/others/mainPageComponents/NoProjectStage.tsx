import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "../Spinner";
import { useCreateProject } from "@/services/private/project/mutation";
import { useNavigate } from "react-router";

import { updateProjectStore } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { taskSectionColors } from "@/lib/utils/shared";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { FolderClosed, Menu } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const formSchema = z.object({
    projectName: z.string().min(1, "Project Name is required"),
    projectCode: z.string().optional(),
    projectColor: z.string().optional()
})

const NoProjectStage = () => {

    const navigate = useNavigate()

    const sidebar = useSidebar()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

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
        isPending: isCreatingProject,
    } = useCreateProject((response) => {
        if (!selectedWorkspace) return
        form.reset()
        updateProjectStore({
            noProjects: false
        })
        navigate(`/p/w/${selectedWorkspace.workspace_id}/d/${response.project_id}`)
    })

    const onSubmitCreateProject = async (values: z.infer<typeof formSchema>) => {
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

    return (
        <div
            className={` size-full grow flex items-center justify-center `}
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
                    <EmptyTitle>No Projects Yet</EmptyTitle>
                    <EmptyDescription>This workspace doesn't have any projects. Please create one.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitCreateProject)} className="flex flex-col gap-4" >
                            <div className="flex flex-col gap-4 py-[2rem]" >
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
                                            <FormDescription className="text-left" >
                                                This is your public display name.
                                            </FormDescription>
                                            <FormMessage className="text-left" />
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
                                            <FormDescription className="text-left" >
                                                This code will be used as a prefix for tasks. You can update this later.
                                            </FormDescription>
                                            <FormMessage className="text-left" />
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
                            </div>
                            <Button
                                variant="outline"
                                disabled={isCreatingProject}
                                type="submit"
                            >
                                {
                                    isCreatingProject ?
                                        <Spinner size="sm" />
                                        :
                                        "Create project"
                                }
                            </Button>
                        </form>
                    </Form>
                </EmptyContent>
            </Empty>
        </div>
    )

}

export default NoProjectStage;