import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useGetProjects } from "@/services/private/project/query"
import { updateDialogsStore } from "@/stores/dialogs"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { CheckCircle2, Plus } from "lucide-react"
import { useContext, useLayoutEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { WebSocketContext } from "../websocket/WebsocketHandler"

const ProjectsList_MainDashboardPane = () => {

    const { workspace_slug, project_slug } = useParams()
    const navigate = useNavigate()

    const {
        selectedWorkspace,
        selectedProject
    } = useGlobalsStore()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)

    const {
        data : projects,
        isLoading : isProjectsLoading,
    } = useGetProjects( selectedWorkspace?.workspace_id )

    // const [ selectedProject, setSelectedProject ] = useState<TProject | undefined>(undefined)

    // const selectedProject = useMemo<TProject | undefined>(() => {
    //     const project = projects?.find((project) => project.project_slug === project_slug )
    //     if ( selectedProject && project !== selectedProject.project_id ) {
    //         pathChangeMethods.updateProjectPath(selectedProject.project_id)
    //     }
    //     updateGlobalsStore({
    //         selectedProject : selectedProject || null
    //     })
    //     return project
    // }, [ projects, project_slug ])
    
    useLayoutEffect(() => {
        const project = projects?.find((project) => project.project_slug === project_slug )
        if ( project && project.project_id !== selectedProject?.project_id ) {
            pathChangeMethods.updateProjectPath(project.project_id)
        }
        updateGlobalsStore({
            selectedProject : project || null
        })
    }, [ projects, project_slug ])

    useLayoutEffect(() => {
        if ( !project_slug ) {
            if ( projects ) {
                if ( projects.length > 0 ) {
                    navigate(`/p/w/${workspace_slug}/d/${projects[0].project_slug}/t`)
                    updateGlobalsStore({
                        noProjects : false
                    })
                } else {
                    updateGlobalsStore({
                        noProjects : true
                    })
                }
            }
        }
    }, [ projects, project_slug, workspace_slug ])

    useLayoutEffect(() => {
        updateGlobalsStore({
            projectsIsLoading : isProjectsLoading
        })
    }, [ isProjectsLoading ])

    // // Update the selectedProject in globals store and then send a websocket message to update the websocket client path in the server
    // useLayoutEffect(() => {
    //     if ( selectedProject && selectedProjectFromStore?.project_id !== selectedProject.project_id ) {
    //         pathChangeMethods.updateProjectPath(selectedProject.project_id)
    //     }
    //     updateGlobalsStore({
    //         selectedProject : selectedProject || null
    //     })
    // }, [ selectedProject ])

    return (
        <div
            className={cn(
                ` w-full h-fit `
            )}
        >
            <div
                className={cn(
                    ` w-full h-fit p-2 `,
                    ` flex items-center justify-between `
                )}
            >
                <p>Projects</p>
                <div
                    className=" flex items-center gap-2 "
                >
                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        onClick={() => {
                            updateDialogsStore({
                                createProjectDialog : {
                                    open : true
                                }
                            })
                        }}
                    >
                        <Plus/>
                    </Button>
                </div>
            </div>
            <Separator className="mb-2" />
            <div
                className={cn(
                    ` w-full h-fit gap-1 `,
                    ` flex flex-col `
                )}
            >
                {
                    isProjectsLoading &&
                    Array.from({ length : 3 }).map((_, index) => (
                        <Skeleton key={index} className={cn(
                            ` w-full h-10 `
                        )} />
                    ))
                }
                {
                    ( !isProjectsLoading && projects ) &&
                    projects.map((project) => 
                        <button
                            className={cn(
                                ` w-full h-8 px-4 `,
                                ` flex items-center justify-between `,
                                ` rounded-md `,
                                ` hover:bg-border `,
                                selectedProject?.project_id === project.project_id && ` bg-border `
                            )}
                            disabled={selectedProject?.project_id === project.project_id}
                            onClick={() => {
                                navigate(`/p/w/${workspace_slug}/d/${project.project_slug}/t`)
                            }}
                        >
                            <p className=" text-sm font-medium " >{project.project_name}</p>
                            {
                                selectedProject?.project_id === project.project_id &&
                                <CheckCircle2 className=" size-4 "/>
                            }
                        </button>
                    )
                }
            </div>
        </div>
    )

}

export default ProjectsList_MainDashboardPane;