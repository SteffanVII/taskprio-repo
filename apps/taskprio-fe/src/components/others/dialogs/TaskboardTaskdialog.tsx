import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useGetTask } from "@/services/private/task/query"
import { useGetTaskboardSections } from "@/services/private/tasksection/query"
import { updateGlobalsStore, useGlobalsStore } from "@/stores/globals"
import { X } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import Spinner from "../Spinner"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDebounce } from "use-debounce"
import { useUpdateTaskPrimitiveFields } from "@/services/private/task/mutation"
import TaskAssigner from "../shared/task/TaskAssigner"
import { TUpdateTaskPrimitiveFieldsPayload } from "@/services/private/task/types"
import TaskEstimateInput from "../shared/task/TaskEstimateInput"
import TaskTimeLogger from "../shared/task/TaskTimeLogger"
import { MakeOptional } from "@/lib/utils/shared"
import { TTaskTimeLog } from "@repo/taskprio-types/src"

export const TaskboardTaskDialog = () => {

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const {
        task_id
    } = useParams()

    const {
        selectedTaskboard,
        selectedTask
    } = useGlobalsStore()

    const taskIdExists = task_id !== undefined && task_id !== ""

    const [ selectedTaskSection, setSelectedTaskSection ] = useState<string>( selectedTask?.task_section_id ?? "" )
    
    const [ dataLoaded, setDataLoaded ] = useState<boolean>( false )
    
    const [ taskTitle, setTaskTitle ] = useState<string>("")
    const [ debounceTaskTitle ] = useDebounce( taskTitle, 300 )
    const [ taskDescription, setTaskDescription ] = useState<string | null>( null )
    const [ debounceTaskDescription ] = useDebounce( taskDescription, 300 )
    const [ taskEstimate, setTaskEstimate ] = useState<number | null>( null )
    const [ debounceTaskEstimate ] = useDebounce( taskEstimate, 300 )

    const [ assignees, setAssignees ] = useState<string[]>( [] )
    const [ timeLogs, setTimeLogs ] = useState<MakeOptional<TTaskTimeLog, "created_at">[]>( [] )

    const {
        data : task,
        isLoading : isLoadingTask
    } = useGetTask({
        pathParameter : {
            task_id : task_id
        },
        enabled : task_id !== undefined
    })

    const {
        data : taskboardSections,
        isLoading : isLoadingTaskboardSections
    } = useGetTaskboardSections({
        pathParameter : {
            task_board_id : selectedTaskboard?.task_board_id
        },
        pathQuery : {
            include_tasks : false
        }
    })

    const {
        mutateAsync : updateTaskPrimitiveFieldsMutateAsync
    } = useUpdateTaskPrimitiveFields()

    const closeHandler = () => {
        navigate( pathname.split("/").slice(0, -1).join("/") )
        updateGlobalsStore({
            selectedTask : null
        })
    }

    useLayoutEffect(() => {

        if ( taskIdExists && dataLoaded ) {

            const body : TUpdateTaskPrimitiveFieldsPayload["body"] = {}

            if ( debounceTaskTitle !== selectedTask?.task_title && debounceTaskTitle !== "" ) {
                body.task_title = debounceTaskTitle
            }

            if ( debounceTaskDescription !== selectedTask?.task_description ) {
                body.task_description = debounceTaskDescription
            }

            if ( debounceTaskEstimate !== task?.task_estimate ) {
                body.task_estimate = debounceTaskEstimate
            }

            if ( Object.keys( body ).length > 0 ) {
                if ( !selectedTask ) return
                updateGlobalsStore({
                    selectedTask : {
                        ...selectedTask,
                        task_title : debounceTaskTitle,
                        task_description : debounceTaskDescription,
                        task_estimate : debounceTaskEstimate
                    }
                })
                updateTaskPrimitiveFieldsMutateAsync({
                    task_id : task_id!,
                    body
                })
            }

        }

    }, [
        task_id,
        debounceTaskTitle,
        debounceTaskDescription,
        debounceTaskEstimate
    ])

    useLayoutEffect(() => {
        if ( task ) {
            setTaskTitle( task.task_title )
            setTaskDescription( task.task_description )
            setTaskEstimate( task.task_estimate )
            setAssignees( task.assignees.map( assignee => assignee.user_id ) )
            setTimeLogs( task.task_time_logs ) 
            updateGlobalsStore({
                selectedTask : task
            })
            setDataLoaded( true )
        }
        setSelectedTaskSection( selectedTask?.task_section_id ?? "" )
    }, [ task ])

    return (
        <Dialog
            open={ task_id !== undefined }
            onOpenChange={ value => {
                if ( !value ) {
                    console.log("Data loaded set to false");
                    setDataLoaded( false )
                    closeHandler()
                }
            } }
        >
            <DialogContent
                noCloseButton={ true }
                className={cn(
                    ` !max-w-screen !max-h-screen w-fit h-fit `,
                    ` shadow-none !border-none !bg-transparent !p-0 `
                )}
            >
                <div
                    className={cn(
                        // ` absolute bottom-0 right-[1rem] `,
                        ` w-[80rem] h-fit min-h-[60rem] max-h-screen `,
                        ` flex flex-col `,
                        ` bg-background border border-border rounded-md shadow `,
                        ` animate-in fade-in slide-in-from-bottom-60 duration-200 ease-out `,
                    )}
                    // ref={(node) => {

                    //     // Add click outside detection
                    //     const handleClickOutside = (e: MouseEvent) => {
                    //         if (node && !node.contains(e.target as Node) && task_id) {
                    //             closeHandler()
                    //         }
                    //     };
                        
                    //     // Add event listener when component mounts
                    //     document.addEventListener("mousedown", handleClickOutside);
                        
                    //     // Return cleanup function
                    //     return () => {
                    //         document.removeEventListener("mousedown", handleClickOutside);
                    //     };

                    // }}
                >
                    {
                        isLoadingTask || isLoadingTaskboardSections ? 
                        <div className=" size-full p-8 flex items-center justify-center " >
                            <Spinner size="md"/>
                        </div>
                        :
                        <>
                            {/* Header */}
                            <div
                                className={cn(
                                    ` w-full h-fit p-2 `,
                                    ` flex gap-2 items-center  `,
                                    ` border-b border-border `
                                )}
                            >
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    onClick={closeHandler}
                                ><X className=" size-4 " /></Button>
                                <div
                                    className={` flex items-center gap-2 ml-auto `}
                                >
                                    <p className=" font-bold " >{selectedTaskboard?.task_board_name}</p> /
                                    <Select
                                        value={selectedTaskSection}
                                    >
                                        <SelectTrigger
                                            className=" border-none font-semibold shadow-none "
                                        >
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                taskboardSections?.map( taskboardSection => (
                                                    <SelectItem
                                                        key={taskboardSection.task_section_id}
                                                        value={taskboardSection.task_section_id}
                                                    >
                                                        {taskboardSection.task_section_name}
                                                    </SelectItem>
                                                ) )
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Body */}
                            <div
                                className={cn(
                                    ` relative h-full flex grow gap-2 `
                                )}
                            >
                                {/* Main Body */}
                                <div
                                    className={cn(
                                        ` h-full grow `
                                    )}
                                >
                                    <div
                                        className={cn(
                                            ` p-4 `,
                                            ` flex flex-col gap-4 `
                                        )}
                                    >
                                        <Input
                                            className={cn(
                                                ` h-fit !p-4 !py-2 `,
                                                ` !text-2xl font-bold `,
                                                ` border-none shadow-none `
                                            )}
                                            placeholder="Task Title"
                                            value={ taskTitle }
                                            onChange={ ( e ) => {
                                                setTaskTitle( e.target.value )
                                            } }
                                        />

                                        <Textarea
                                            className={cn(
                                                ` !p-4 !py-2 `,
                                                ` border-none shadow-none `
                                            )}
                                            placeholder="Description"
                                            value={ taskDescription || "" }
                                            onChange={ ( e ) => {
                                                setTaskDescription( e.target.value === "" ? null : e.target.value )
                                            } }
                                        />
                                    </div>
                                </div>

                                <div className=" w-[1px] bg-border" ></div>

                                {/* Right Body */}
                                <div
                                    className={cn(
                                        ` w-[20rem] p-2 pl-1 `,
                                        ` flex flex-col gap-4 `
                                    )}
                                >
                                    <div
                                        className=" flex justify-between gap-2 p-2"
                                    >
                                        <p className=" text-sm " >Assignees</p>
                                        <TaskAssigner
                                            task_id={ task_id! }
                                            assignees={ assignees }
                                            onAssigneesChange={ setAssignees }
                                        />
                                    </div>
                                    <div
                                        className=" flex justify-between gap-4 p-2"
                                    >
                                        <p className=" text-sm " >Estimate</p>
                                        <TaskEstimateInput
                                            estimate={ taskEstimate }
                                            setEstimate={ setTaskEstimate }
                                        />
                                    </div>
                                    <div
                                        className=" grid gap-8 p-2 "
                                        style={{
                                            gridTemplateColumns : "min-content 1fr"
                                        }}
                                    >
                                        <p className=" text-sm " >Time Logged</p>
                                        <TaskTimeLogger
                                            taskId={ task_id! }
                                            taskEstimate={ taskEstimate }
                                            timeLogs={ timeLogs }
                                            setTimeLogs={ setTimeLogs }
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </div>
            </DialogContent>
        </Dialog>
    )

}