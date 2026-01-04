import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { updateDialogsStore } from "@/stores/dialogs"
import { updateGlobalsStore, useGlobalsStore_noProjects, useGlobalsStore_projects, useGlobalsStore_projectsIsLoading, useGlobalsStore_selectedProject, useGlobalsStore_user, useGlobalsStore_workspaceRole, useGlobalsStore_workspacesIsLoading } from "@/stores/globals"

import { EProjectRole, EWorkspaceRole, TProject } from "@repo/taskprio-types/src"
import { Plus } from "lucide-react"
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
    const workspaceRole = useGlobalsStore_workspaceRole()
    const workspacesIsLoading = useGlobalsStore_workspacesIsLoading()
    const projectsIsLoading = useGlobalsStore_projectsIsLoading()
    const selectedProject = useGlobalsStore_selectedProject()
    const projects = useGlobalsStore_projects()
    const noProjects = useGlobalsStore_noProjects()

    const showSkeleton = useMemo(() => {
        return (projectsIsLoading || workspacesIsLoading)
    }, [projectsIsLoading, workspacesIsLoading])

    const showNoProjectsState = useMemo(() => {
        return (!projectsIsLoading && !workspacesIsLoading && noProjects)
    }, [projectsIsLoading, workspacesIsLoading, noProjects])

    const showProjectsButtons = useMemo(() => {
        return (!projectsIsLoading && !workspacesIsLoading && !!projects)
    }, [projectsIsLoading, workspacesIsLoading, projects])

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
        localStorage.setItem( import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, project.project_id )
        channelActions.joinProjectChannel(project.project_id)

    }

    return (
        <div
            className={cn(
                ` w-full h-fit `,
                ` bg-muted rounded-md border overflow-hidden`,
            )}
        >
            <div
                className={cn(
                    ` w-full h-fit pl-3 `,
                    ` flex items-center justify-between `
                )}
            >
                <p className="text-lg font-bold" >Projects</p>
                <div
                    className=" flex items-center gap-2 "
                >
                    <Button
                        size={"icon-lg"}
                        variant={"ghost"}
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
                    Array.from({ length : 5 }).map((_, index) => (
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
                        <button
                            key={project.project_id}
                            className={cn(
                                ` relative w-full h-8 px-4 py-5 `,
                                ` flex items-center gap-4 `,
                                ` transition-all `,
                                ` border-r-[0.6rem] `,
                                ` hover:bg-border `,
                                selectedProject?.project_id === project.project_id && ` text-primary bg-border overflow-hidden `,
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