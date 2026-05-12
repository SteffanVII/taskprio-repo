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
import Spinner from "../Spinner";

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
            project_name : "",
            project_abbreviation : "",
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
            <div className="SettingsSectionHeader" >
                <h3 className={`SettingsSectionHeaderTitle`} >Customization</h3>
                <p className="SettingsSectionHeaderDescription" >
                    Customize the project.
                </p>
            </div>
            <div
                className={cn(
                    `SettingsSectionContent`
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
                                        {...field}
                                        id="projectName"
                                        placeholder="Enter project name"
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
                                        {...field}
                                        id="projectAbbreviation"
                                        placeholder="Enter project abbreviation"
                                        className="mt-2"
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
                        disabled={updateProjectCustomizationPending}
                    >
                        {
                            updateProjectCustomizationPending ? <Spinner/> : <><SaveIcon/> Save</>
                        }
                    </Button>
                </div>
            </div>
        </>
    )

}

export default Customization_ProjectSettingsPage;