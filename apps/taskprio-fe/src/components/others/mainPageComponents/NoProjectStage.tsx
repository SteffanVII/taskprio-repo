import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Spinner from "../Spinner";
import { useCreateProject } from "@/services/private/project/mutation";
import { useNavigate } from "react-router";
import { useState } from "react";
import { updateGlobalsStore, useGlobalsStore_selectedWorkspace } from "@/stores/globals";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const NoProjectStage = () => {

    const navigate = useNavigate()

    const sidebar = useSidebar()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const [ projectName, setProjectName ] = useState<string>("")

    const {
        mutateAsync : createProject,
        isPending : isCreatingProject,
    } = useCreateProject( ( response ) => {
        if ( !selectedWorkspace ) return
        setProjectName("")
        updateGlobalsStore({
            noProjects : false
        })
        navigate(`/p/w/${selectedWorkspace.workspace_id}/d/${response.project_id}`)
    } )

    const onSubmitCreateProject = async ( projectName : string ) => {
        if ( !selectedWorkspace ) return
        await createProject({
            body : {
                project_name : projectName,
                workspace_id : selectedWorkspace.workspace_id
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
                ><Menu/></Button>
            }
            <Card
                className={cn(
                    ` w-[30rem] border-none shadow-none `
                )}
            >
                <CardHeader>
                    <CardTitle>No Projects</CardTitle>
                    <CardDescription>This workspace doesn't have any projects. Please create one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="Project name"
                        value={projectName}
                        onChange={ ( e ) => setProjectName( e.target.value ) }
                        disabled={isCreatingProject}
                    />
                </CardContent>
                <CardFooter
                    className=" justify-end "
                >
                    <Button
                        variant="outline"
                        disabled={isCreatingProject}
                        onClick={ () => onSubmitCreateProject( projectName ) }
                    >
                        {
                            isCreatingProject ?
                            <Spinner size="sm" />
                            :
                            "Create project"
                        }
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )

}

export default NoProjectStage;