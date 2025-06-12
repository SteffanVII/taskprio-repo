import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProjectTaskboards } from "@/services/private/taskboard/query";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { Plus } from "lucide-react";
import { useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { WebSocketContext } from "../websocket/WebsocketHandler";


const TaskboardList = () => {

    const navigate = useNavigate()

    const {
        task_board_slug
    } = useParams()

    const {
        selectedWorkspace,
        selectedProject,
        selectedTaskboard
    } = useGlobalsStore()

    const {
        pathChangeMethods
    } = useContext(WebSocketContext)
    
    const {
        data : taskboards,
        isLoading : isLoadingTaskboards
    } = useGetProjectTaskboards( {
        query : {
            project_id : selectedProject?.project_id
        }
    } )

    // const selectedTaskboard = useMemo(() => {
    //     if ( !taskboards ) return null
    //     const taskboard = taskboards.find( taskboard => taskboard.task_board_slug === task_board_slug )
    //     return taskboard
    // }, [ taskboards, task_board_slug ])

    useLayoutEffect(() => {
        if ( !task_board_slug ) {
            if ( taskboards && taskboards.length > 0 ) {
                navigate( `/p/w/${selectedWorkspace?.workspace_slug}/d/${selectedProject?.project_slug}/t/${taskboards?.[0].task_board_slug}` )
            }
        }
    }, [ taskboards, task_board_slug, selectedProject, selectedWorkspace ])

    useLayoutEffect(() => {
        const taskboard = taskboards?.find( taskboard => taskboard.task_board_slug === task_board_slug ) || null
        if ( taskboard && taskboard.task_board_id !== selectedTaskboard?.task_board_id ) {
            pathChangeMethods.updateBoardPath(taskboard.task_board_id)
        }
        updateGlobalsStore({
            selectedTaskboard : taskboard || null
        })
    }, [ taskboards, task_board_slug ])

    return (
        <div
            className={cn(
                ` w-full h-fit px-2 `,
                ` flex gap-2 `,
                ` bg-background `,
                ` border-b border-border `
            )}
        >
            {/* <Button
                variant={"ghost"}
                className=" flex items-center gap-2 "
            >New Board <Plus className="size-4" /></Button> */}
            <div
                className={cn(
                    ` w-full h-fit `,
                    ` grow flex gap-2 overflow-x-auto `
                )}
            >
                {
                    taskboards?.map( taskboard => (
                        <Button
                            key={taskboard.task_board_id}
                            // variant={ selectedTaskboard?.task_board_slug === taskboard.task_board_slug ? "default" : "ghost" }
                            variant={ "ghost" }
                            disabled={ selectedTaskboard?.task_board_slug === taskboard.task_board_slug }
                            className={cn(
                                ` rounded-none border-b-4 pt-3 `,
                                (selectedTaskboard?.task_board_slug === taskboard.task_board_slug) && ` border-primary  `
                            )}
                            onClick={() => {
                                navigate( `/p/w/${selectedWorkspace?.workspace_slug}/d/${selectedProject?.project_slug}/t/${taskboard.task_board_slug}` )
                            }}
                        >{taskboard.task_board_name}</Button>
                    ) )
                }
            </div>
        </div>
    )

}

export default TaskboardList;