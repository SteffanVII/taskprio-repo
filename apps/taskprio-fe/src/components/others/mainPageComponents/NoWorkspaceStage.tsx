import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateWorkspace } from "@/services/private/workspace/mutation"
import { useState } from "react"
import { useNavigate } from "react-router"
import Spinner from "../Spinner"

const NoWorkspaceStage = () => {

    const navigate = useNavigate()

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
                ` size-full max-w-screen max-h-screen `,
                ` flex items-center justify-center `,
                ` bg-background z-50 `
            )}
        >
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