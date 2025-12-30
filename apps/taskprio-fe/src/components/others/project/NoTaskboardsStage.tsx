import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateTaskboard } from "@/services/private/taskboard/mutation"
import { updateGlobalsStore, useGlobalsStore_selectedProject, useGlobalsStore_selectedWorkspace } from "@/stores/globals"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useNavigate } from "react-router"
import Spinner from "../Spinner"

const createTaskboardFormSchema = z.object({
    taskboard_name : z.string().min(1, "Taskboard name is required")
})

const NoTaskboardsStage = () => {

    const navigate = useNavigate()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()

    const {
        mutateAsync : createTaskboardTrigger,
        isPending : createTaskboardIsPending
    } = useCreateTaskboard({
        onSuccess : ( data ) => {
            if ( !selectedWorkspace ) return
            updateGlobalsStore({
                noTaskboards : false
            })
            navigate(`/p/w/${selectedWorkspace.workspace_id}/d/${data.project_id}/t/${data.task_board_id}`)
        }
    })

    const form = useForm<z.infer<typeof createTaskboardFormSchema>>({
        resolver : zodResolver(createTaskboardFormSchema),
        defaultValues : {
            taskboard_name : ""
        }
    })

    const onSubmitCreateTaskboard = ( data : z.infer<typeof createTaskboardFormSchema> ) => {
        if ( !selectedProject ) return
        createTaskboardTrigger({
            taskboard_name : data.taskboard_name,
            project_id : selectedProject.project_id
        })
    }

    return (
        <div
            className={` size-full flex items-center justify-center bg-background `}
        >
            <Card
                className={cn(
                    ` w-[30rem] border-none shadow-none `
                )}
            >
                <CardHeader>
                    <CardTitle>No Taskboards</CardTitle>
                    <CardDescription>This project doesn't have any taskboards. Please create one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...form}
                    >
                        <form>
                            <FormField
                                control={form.control}
                                name="taskboard_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Taskboard Name"
                                                disabled={createTaskboardIsPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
                <CardFooter
                    className=" justify-end "
                >
                    <Button
                        variant="outline"
                        disabled={createTaskboardIsPending || createTaskboardIsPending}
                        onClick={ () => {
                            form.handleSubmit(onSubmitCreateTaskboard)()
                        } }
                    >
                        {
                            createTaskboardIsPending ? <Spinner/> : "Create project"
                        }
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )

}

export default NoTaskboardsStage;