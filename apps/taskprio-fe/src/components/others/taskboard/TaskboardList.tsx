import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProjectTaskboards } from "@/services/private/taskboard/query";
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals";
import { PlusIcon } from "lucide-react";
import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router";


const TaskboardList = () => {

    const navigate = useNavigate()

    const {
        project_id,
        task_board_id
    } = useParams()

    const {
        selectedWorkspace,
        selectedProject,
        selectedTaskboard
    } = useGlobalsStore()
    
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
        if ( !task_board_id ) {
            if ( taskboards && taskboards.length > 0 ) {
                // Check if the selected project is the same as the project_id
                // If it's not means the user might have switched project and the project data hasn't fetched yet
                // This is to prevent fetching the taskboard data that doesn't belong to the selected project
                if ( selectedProject?.project_id === project_id ) {
                    navigate( `/p/w/${selectedWorkspace?.workspace_id}/d/${selectedProject?.project_id}/t/${taskboards?.[0].task_board_id}` )
                }
            }
        }
    }, [ taskboards, task_board_id, selectedProject, selectedWorkspace ])

    // Update the selected taskboard in the globals store
    useLayoutEffect(() => {
        const taskboard = taskboards?.find( taskboard => taskboard.task_board_id === task_board_id ) || null
        updateGlobalsStore({
            selectedTaskboard : taskboard || null
        })
    }, [ taskboards, task_board_id ])

    return (
        <div
            className={cn(
                ` w-full h-fit `,
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
                            // disabled={ selectedTaskboard?.task_board_id === taskboard.task_board_id }
                            className={cn(
                                ` rounded-none border-b-4 pt-3 `,
                                (selectedTaskboard?.task_board_id === taskboard.task_board_id) && ` border-primary bg-foreground/10`
                            )}
                            onClick={() => {
                                navigate( `/p/w/${selectedWorkspace?.workspace_id}/d/${selectedProject?.project_id}/t/${taskboard.task_board_id}` )
                            }}
                        >{taskboard.task_board_name}</Button>
                    ) )
                }
                <Button
                    variant={"ghost"}
                    className="rounded-none"
                >
                    <PlusIcon/> Add Board
                </Button>
            </div>
        </div>
    )

}

export default TaskboardList;