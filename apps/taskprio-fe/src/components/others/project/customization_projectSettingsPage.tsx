import { Button } from "@/components/ui/button";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { taskSectionColors } from "@/lib/utils/shared";
import { useUpdateProjectCustomization } from "@/services/private/project/mutation";
import { useGetProject } from "@/services/private/project/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { z } from "zod";

const projectCustomizationSchema = z.object({
    project_name : z.string().min(1, { message : "Project name is required." }),
    project_abbreviation : z.string().min(1, { message : "Project abbreviation is required." }).max(16, { message : "Project abbreviation must be or less than 16 characters." }),
    project_color : z.string().min(1, { message : "Project color is required." })
})

const Customization_ProjectSettingsPage = () => {

    const {
        project_id
    } = useParams()

    const {
        data : projectData
    } = useGetProject({
        project_id 
    })

    const {
        mutate : updateProjectCustomization,
        isPending : updateProjectCustomizationPending
    } = useUpdateProjectCustomization()

    const projectCustomizationForm = useForm<z.infer<typeof projectCustomizationSchema>>({
        resolver : zodResolver(projectCustomizationSchema),
        defaultValues : {
            project_color : "#ffffff"
        }
    })

    const handleSubmit = ( data : z.infer<typeof projectCustomizationSchema> ) => {

        if ( project_id ) {
            updateProjectCustomization({
                params : {
                    project_id
                },
                body : data
            })
        }

    }

    useEffect(() => {
        if ( projectData ) {
            projectCustomizationForm.reset({
                project_name : projectData.project_name,
                project_abbreviation : projectData.project_abbreviation,
                project_color : projectData.project_color || "#ffffff"
            })
        }
    }, [projectData])

    return (
        <>
            <div className=" flex flex-col space-y-2 " >
                <h3 className={` text-lg font-medium `} >Customization</h3>
                <p className=" text-sm text-muted-foreground " >
                    Customize the project.
                </p>
            </div>
            <div
                className={cn(
                    `space-y-4`,
                    `p-4 border border-transparent rounded-md`,
                    `hover:bg-secondary/50 hover:border-foreground/10`
                )}
            >
                <Form {...projectCustomizationForm}>
                    <form
                        className={cn(
                            `flex flex-col gap-4`
                        )}
                    >
                        <FormField
                            control={projectCustomizationForm.control}
                            name="project_name"
                            render={({field}) => (
                                <FormItem className="gap-4" >
                                    <FormLabel htmlFor="projectName" >Project Name</FormLabel>
                                    <Input
                                        id="projectName"
                                        placeholder="Enter project name"
                                        {...field}
                                    />
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={projectCustomizationForm.control}
                            name="project_abbreviation"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel htmlFor="projectAbbreviation" >Project Abbreviation</FormLabel>
                                    <Input
                                        id="projectAbbreviation"
                                        placeholder="Enter project abbreviation"
                                        className="mt-2"
                                        {...field}
                                        onChange={ event => {
                                            field.onChange(event.target.value.toUpperCase())
                                        } }
                                    />
                                    <FormDescription>{(field.value || "").length}/16</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={projectCustomizationForm.control}
                            name="project_color"
                            render={({field}) => (
                                <FormItem className="gap-4" >
                                    <FormLabel>Project Color</FormLabel>
                                    <div
                                        className={cn(
                                            `flex gap-2 flex-wrap`
                                        )}
                                    >
                                        {
                                            taskSectionColors.map( color => (
                                                <button
                                                    type="button"
                                                    key={color}
                                                    className={cn(
                                                        `size-[2rem] border rounded-md cursor-pointer transition-all`,
                                                        `hover:shadow-lg hover:-translate-y-[0.2rem]`,
                                                        field.value === color && `outline-primary outline-2`
                                                    )}
                                                    style={{
                                                        backgroundColor : color
                                                    }}
                                                    onClick={() => field.onChange(color)}
                                                ></button>
                                            ) )
                                        }
                                    </div>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <div
                    className={cn(
                        `flex`
                    )}
                >
                    <Button
                        variant={"outline"}
                        onClick={ () => {
                            projectCustomizationForm.handleSubmit(handleSubmit)()
                        } }
                        isLoading={updateProjectCustomizationPending}
                    ><SaveIcon/> Save</Button>
                </div>
            </div>
        </>
    )

}

export default Customization_ProjectSettingsPage;