import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { updateDialogsStore } from "@/stores/dialogs"
import { updateGlobalsStore, useGlobalsStore_noProjects, useGlobalsStore_projects, useGlobalsStore_projectsIsLoading, useGlobalsStore_selectedProject, useGlobalsStore_user, useGlobalsStore_workspaceIsLoading, useGlobalsStore_workspaceRole } from "@/stores/globals"

import { EProjectRole, EWorkspaceRole, TProject } from "@repo/taskprio-types/src"
import { Plus } from "lucide-react"
import { useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

const ProjectsList_MainDashboardPane = () => {

    const navigate = useNavigate()
    const { workspace_id } = useParams()
    const { pathname } = useLocation()

    const user = useGlobalsStore_user()
    const workspaceRole = useGlobalsStore_workspaceRole()
    const workspaceIsLoading = useGlobalsStore_workspaceIsLoading()
    const projectsIsLoading = useGlobalsStore_projectsIsLoading()
    const selectedProject = useGlobalsStore_selectedProject()
    const projects = useGlobalsStore_projects()
    const noProjects = useGlobalsStore_noProjects()

    const showSkeleton = useMemo(() => {
        return (projectsIsLoading || workspaceIsLoading)
    }, [projectsIsLoading, workspaceIsLoading])

    const showNoProjectsState = useMemo(() => {
        return (!projectsIsLoading && !workspaceIsLoading && noProjects)
    }, [projectsIsLoading, workspaceIsLoading, noProjects])

    const showProjectsButtons = useMemo(() => {
        return (!projectsIsLoading && !workspaceIsLoading && !!projects)
    }, [projectsIsLoading, workspaceIsLoading, projects])

    const handleProjectButtonOnClick = ( project : TProject ) => {
        const projectRole : EProjectRole | null = project.project_members.find( member => member.user_id === user?.user_id )?.project_role ?? null
        updateGlobalsStore({
            selectedProject : project,
            projectRole,
            noTaskboards : false,
            noProjects : false
        })
        if ( pathname.includes("/project_settings") ) {
            navigate(`/p/w/${workspace_id}/d/${project.project_id}/project_settings`)
        } else {
            navigate(`/p/w/${workspace_id}/d/${project.project_id}/t`)
        }
    }

    return (
        <div
            className={cn(
                ` w-full h-fit `
            )}
        >
            <div
                className={cn(
                    ` w-full h-fit p-4 `,
                    ` flex items-center justify-between `
                )}
            >
                <p>Projects</p>
                <div
                    className=" flex items-center gap-2 "
                >
                    <Button
                        size={"icon"}
                        variant={"outline"}
                        onClick={() => {
                            updateDialogsStore({
                                createProjectDialog : {
                                    open : true
                                }
                            })
                        }}
                        className={cn(
                            `opacity-0 pointer-events-none`,
                            (workspaceRole === EWorkspaceRole.OWNER || workspaceRole === EWorkspaceRole.ADMIN)  && `opacity-100 pointer-events-auto`
                        )}
                    >
                        <Plus/>
                    </Button>
                </div>
            </div>
            <Separator className="mb-2" />
            <div
                className={cn(
                    ` w-full h-fit gap-2 p-2 `,
                    ` flex flex-col `
                )}
            >
                {
                    showSkeleton &&
                    Array.from({ length : 5 }).map((_, index) => (
                        <Skeleton key={index} className={cn(
                            ` w-full h-[2rem] `
                        )} />
                    ))
                }
                {
                    showNoProjectsState && 
                    <p className="font-bold text-center py-[1rem]" >No Projects Found</p>
                }
                {
                    showProjectsButtons &&
                    projects!.map((project) => 
                        <button
                            key={project.project_id}
                            className={cn(
                                ` relative w-full h-8 px-4 `,
                                ` flex items-center gap-4 `,
                                ` transition-all `,
                                ` border-r-[0.6rem] rounded-md `,
                                ` hover:bg-border `,
                                selectedProject?.project_id === project.project_id && ` text-primary bg-border shadow-2xl overflow-hidden `,
                                getHexLuminance(project.project_color) > 0.4 ?
                                `text-black` :
                                `text-white`
                            )}
                            style={{
                                borderColor : project.project_color
                            }}
                            disabled={selectedProject?.project_id === project.project_id}
                            onClick={() => handleProjectButtonOnClick(project)}
                        >
                            <p className=" text-sm font-medium text-foreground " >{project.project_name}</p>
                        </button>
                    )
                }
            </div>
        </div>
    )

}

export default ProjectsList_MainDashboardPane;