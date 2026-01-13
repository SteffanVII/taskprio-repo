import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { updateDialogsStore } from "@/stores/dialogs"
import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals"
import { updateTaskboardStore } from "@/stores/taskboard"
import { updateProjectStore, useProjectStore_noProjects, useProjectStore_projects, useProjectStore_projectsIsLoading, useProjectStore_selectedProject } from "@/stores/project"
import { useWorkspaceStore_workspaceRole, useWorkspaceStore_workspacesIsLoading } from "@/stores/workspace"

import { EProjectRole, EWorkspaceRole, TProject } from "@repo/taskprio-types/src"
import { Plus, Settings2 } from "lucide-react"
import { useContext, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { WebSocketContext } from "../websocket/WebsocketProvider"

const ProjectsList_MainDashboardPane = () => {

    const navigate = useNavigate()
    const { workspace_id } = useParams()
    const { pathname } = useLocation()
    const {
        channelActions
    } = useContext(WebSocketContext)

    const user = useGlobalsStore_user()
    const workspaceRole = useWorkspaceStore_workspaceRole()
    const workspacesIsLoading = useWorkspaceStore_workspacesIsLoading()
    const projectsIsLoading = useProjectStore_projectsIsLoading()
    const selectedProject = useProjectStore_selectedProject()
    const projects = useProjectStore_projects()
    const noProjects = useProjectStore_noProjects()

    const showSkeleton = useMemo(() => {
        return (projectsIsLoading || workspacesIsLoading)
    }, [projectsIsLoading, workspacesIsLoading])

    const showNoProjectsState = useMemo(() => {
        return (!projectsIsLoading && !workspacesIsLoading && noProjects)
    }, [projectsIsLoading, workspacesIsLoading, noProjects])

    const showProjectsButtons = useMemo(() => {
        return (!projectsIsLoading && !workspacesIsLoading && !!projects)
    }, [projectsIsLoading, workspacesIsLoading, projects])

    const handleProjectButtonOnClick = (project: TProject) => {
        const projectRole: EProjectRole | null = project.project_members.find(member => member.user_id === user?.user_id)?.project_role ?? null
        updateProjectStore({
            selectedProject: project,
            projectRole,
            noProjects: false
        })
        updateGlobalsStore({
            selectedTask: null,
        })
        updateTaskboardStore({
            selectedTaskboard: null,
            noTaskboards: false,
        })
        if (pathname.includes("/project_settings")) {
            navigate(`/p/w/${workspace_id}/d/${project.project_id}/project_settings`)
        } else {
            navigate(`/p/w/${workspace_id}/d/${project.project_id}/t`)
        }
        localStorage.setItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, project.project_id)
        channelActions.joinProjectChannel(project.project_id)

    }

    const handleProjectSettingsButtonOnClick = (project: TProject) => {
        navigate(`/p/w/${workspace_id}/d/${project.project_id}/project_settings`)
        updateGlobalsStore({
            selectedTask: null
        })
        updateTaskboardStore({
            selectedTaskboard: null
        })
    }

    return (
        <div
            className={cn(
                ` w-full h-fit p-2 py-0 `,
                ` overflow-hidden`,
            )}
        >
            <div
                className={cn(
                    ` w-full h-fit py-2 pl-2 `,
                    ` flex items-center justify-between `
                )}
            >
                <p className="font-bold" >Projects</p>
                <div
                    className=" flex items-center gap-2 "
                >
                    <Button
                        size={"icon-sm"}
                        variant={"outline"}
                        onClick={() => {
                            updateDialogsStore({
                                createProjectDialog: {
                                    open: true
                                }
                            })
                        }}
                        className={cn(
                            `opacity-0 pointer-events-none`,
                            (workspaceRole === EWorkspaceRole.OWNER || workspaceRole === EWorkspaceRole.ADMIN) && `opacity-100 pointer-events-auto`
                        )}
                    >
                        <Plus />
                    </Button>
                </div>
            </div>
            <Separator
            // className="mb-2"
            />
            <div
                className={cn(
                    ` w-full h-fit `,
                    ` flex flex-col `
                )}
            >
                {
                    showSkeleton &&
                    Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className={cn(
                            ` w-full h-[1rem] !rounded-none `
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
                        <div
                            role="button"
                            key={project.project_id}
                            className={cn(
                                ` relative w-full h-8 pl-2 pr-2 py-5 `,
                                ` flex justify-between items-center`,
                                ` transition-all `,
                                ` border-r-[0.6rem] `,
                                ` hover:bg-border `,
                                selectedProject?.project_id === project.project_id && !pathname.includes("/project_settings") && `pointer-events-none`,
                                selectedProject?.project_id === project.project_id && ` bg-border overflow-hidden `,
                            )}
                            style={{
                                borderColor: project.project_color
                            }}
                            onClick={() => handleProjectButtonOnClick(project)}
                        >
                            <p className=" text-sm font-medium text-foreground " >{project.project_name}</p>
                            {
                                selectedProject?.project_id === project.project_id &&
                                <Button
                                    size={"icon-sm"}
                                    variant={selectedProject?.project_id === project.project_id && pathname.includes("/project_settings") ? "default" : "ghost"}
                                    className={cn(
                                        `pointer-events-auto cursor-pointer`
                                    )}
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleProjectSettingsButtonOnClick(project)
                                    }}
                                >
                                    <Settings2 />
                                </Button>
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )

}

// type TProjectButtonProps = {
//     data : TProject,
//     handleProjectButtonOnClick : ( project : TProject ) => void
// }

// const ProjectButton : React.FC<TProjectButtonProps> = ({
//     data,
//     handleProjectButtonOnClick
// }) => {

//     const selectedProject = useGlobalsStore_selectedProject()

//     return (
//         <Collapsible>
//             <CollapsibleTrigger
//                 render={
//                     <button
//                         key={data.project_id}
//                         className={cn(
//                             ` relative w-full h-8 px-4 `,
//                             ` flex items-center gap-4 `,
//                             ` transition-all `,
//                             ` border-r-[0.6rem] rounded-md rounded-r-none `,
//                             ` hover:bg-border `,
//                             selectedProject?.project_id === data.project_id && ` text-primary bg-border overflow-hidden `,
//                             getHexLuminance(data.project_color) > 0.4 ?
//                             `text-black` :
//                             `text-white`
//                         )}
//                         style={{
//                             borderColor : data.project_color
//                         }}
//                         disabled={selectedProject?.project_id === data.project_id}
//                         onClick={() => handleProjectButtonOnClick(data)}
//                     >
//                         <p className=" text-sm font-medium text-foreground " >{data.project_name}</p>
//                     </button>
//                 }
//             />
//         </Collapsible>
//     )

// }

export default ProjectsList_MainDashboardPane;