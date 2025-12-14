import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateWorkspace } from "@/services/private/workspace/mutation"
import { useState } from "react"
import { useNavigate } from "react-router"
import Spinner from "../Spinner"
import { useSidebar } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"

const NoWorkspaceStage = () => {

    const navigate = useNavigate()
    const sidebar = useSidebar()

    const [ workspaceName, setWorkspaceName ] = useState<string>("")

    const {
        mutateAsync : createWorkspace,
        isPending : isCreatingWorkspace,
    } = useCreateWorkspace()

    const onSubmitCreateWorkspace = async ( workspaceName : string ) => {
        const response = await createWorkspace({
            body : {
                workspace_name : workspaceName
            }
        })
        setWorkspaceName("")
        navigate(`/p/w/${response.workspace_id}`)
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
                ><Menu/></Button>
            }
            <Card
                className={cn(
                    ` w-[30rem] `
                )}
            >
                <CardHeader>
                    <CardTitle>No Workspace</CardTitle>
                    <CardDescription>You're currently not a member of any workspace. Please create one or join a workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="Workspace name"
                        value={workspaceName}
                        onChange={ ( e ) => setWorkspaceName( e.target.value ) }
                        disabled={isCreatingWorkspace}
                    />
                </CardContent>
                <CardFooter
                    className=" justify-end "
                >
                    <Button
                        variant="outline"
                        disabled={isCreatingWorkspace}
                        onClick={ () => onSubmitCreateWorkspace( workspaceName ) }
                    >
                        {
                            isCreatingWorkspace ?
                            <Spinner size="sm" />
                            :
                            "Create workspace"
                        }
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )

}

export default NoWorkspaceStage;