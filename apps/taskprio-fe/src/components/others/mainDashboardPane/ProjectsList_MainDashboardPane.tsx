import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useGetMyWorkspaceRole from "@/lib/hooks/useGetMyWorkspaceRole"
import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { useGetProject, useGetUserProjectsByWorkspace } from "@/services/private/project/query"
import { updateDialogsStore } from "@/stores/dialogs"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { EWorkspaceRole } from "@repo/taskprio-types/src"
import { Plus } from "lucide-react"
import { useLayoutEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

const ProjectsList_MainDashboardPane = () => {

    const { workspace_id, project_id } = useParams()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const {
        user,
        selectedWorkspace,
        selectedProject,
        workspaceRole
    } = useGlobalsStore()

    const {
        data : projects,
        isLoading : isProjectsLoading,
    } = useGetUserProjectsByWorkspace( selectedWorkspace?.workspace_id )

    const {
        data : project
    } = useGetProject({
        project_id
    })
    
    // If no project_id is selected, navigate to the first project once the projects data are available
    useLayoutEffect(() => {
        // If the user is on the task todo page, don't navigate to the first project
        if (
            pathname.includes("/tt") ||
            pathname.includes("/workspace_settings")
        ) return
        
        if ( !project_id ) {
            if ( projects ) {
                if ( projects.length > 0 ) {
                    // Check if the selected workspace is the same as the workspace_id
                    // If it's not means the user might have switched workspace and the workspace data hasn't fetched yet
                    // This is to prevent fetching the project data that doesn't belong to the selected workspace
                    if ( selectedWorkspace?.workspace_id === workspace_id ) {
                        navigate(`/p/w/${workspace_id}/d/${projects[0].project_id}/t`)
                    }
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
    }, [ projects, project_id, workspace_id ])

    // Update the projectsIsLoading in the globals store
    useLayoutEffect(() => {
        updateGlobalsStore({
            projectsIsLoading : isProjectsLoading
        })
    }, [ isProjectsLoading ])

    useLayoutEffect(() => {
        if ( project && project.project_id === project_id ) {
            updateGlobalsStore({
                selectedProject : project,
                projectRole : project.project_members.find( member => member.user_id === user?.user_id )?.project_role ?? null,
                noProjects : false
            })
        }
    }, [ project, project_id ])

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
                    {
                        workspaceRole === EWorkspaceRole.OWNER &&
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
                    }
                </div>
            </div>
            <Separator className="mb-2" />
            <div
                className={cn(
                    ` w-full h-fit gap-2 `,
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
                            key={project.project_id}
                            className={cn(
                                ` relative w-full h-8 px-4 `,
                                ` flex items-center justify-between `,
                                ` rounded-md transition-all `,
                                ` hover:bg-border hover:translate-x-[0.2rem] active:translate-x-0 `,
                                selectedProject?.project_id === project.project_id && ` text-primary bg-border translate-x-[0.2rem] outline-2 shadow-lg overflow-hidden `,
                                getHexLuminance(project.project_color) > 0.4 ?
                                `text-black` :
                                `text-white`
                            )}
                            style={{
                                backgroundColor : project.project_color
                            }}
                            disabled={selectedProject?.project_id === project.project_id}
                            onClick={() => {
                                navigate(`/p/w/${workspace_id}/d/${project.project_id}/t`)
                            }}
                        >
                            <p className=" text-sm font-medium " >{project.project_name}</p>
                            {
                                selectedProject?.project_id === project.project_id &&
                                <span className=" !size-[0.6rem] bg-primary rounded-sm" ></span>
                            }
                        </button>
                    )
                }
            </div>
        </div>
    )

}

export default ProjectsList_MainDashboardPane;