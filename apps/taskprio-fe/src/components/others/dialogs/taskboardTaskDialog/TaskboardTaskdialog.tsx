import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGetTask } from "@/services/private/task/query"
import { updateGlobalsStore, useGlobalsStore_selectedTask } from "@/stores/globals"

import { Trash2, X } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import Spinner from "../../Spinner"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDebounce } from "use-debounce"
import { useMoveTaskToTrash, useUpdateTaskPrimitiveFields } from "@/services/private/task/mutation"
import TaskAssigner from "../../shared/task/TaskAssigner"
import { TUpdateTaskPrimitiveFieldsPayload } from "@/services/private/task/types"
import TaskEstimateInput from "../../shared/task/TaskEstimateInput"
import TaskTimeLogger from "../../shared/task/TaskTimeLogger"
import { MakeOptional } from "@/lib/utils/shared"
import { TTaskTimeLog } from "@repo/taskprio-types/src"
import TaskTagEditor from "../../shared/task/TaskTagEditor"
import CommentSection_TaskboardTaskDialog from "./CommentSection_TaskboardTaskDialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ContentEditor_TaskboardTaskDialog from "./ContentEditor_TaskboardTaskDialog"
import { toast } from "sonner"
import getHexLuminance from "@/lib/utils/hexColorLuminance"

export const TaskboardTaskDialog = () => {

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const {
        task_id
    } = useParams()

    // const selectedTaskboard = useGlobalsStore_selectedTaskboard()
    const selectedTask = useGlobalsStore_selectedTask()

    const taskIdExists = task_id !== undefined && task_id !== ""

    const [ moveToTrashReady, setMoveToTrashReady ] = useState<boolean>( false )

    // const [ selectedTaskSection, setSelectedTaskSection ] = useState<string>( selectedTask?.task_section_id ?? "" )
    
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
        isLoading : isLoadingTask,
        isFetching : isFetchingTask
    } = useGetTask({
        pathParameter : {
            task_id : task_id
        },
        enabled : task_id !== undefined
    })

    // const {
    //     data : taskboardSections,
    //     isLoading : isLoadingTaskboardSections
    // } = useGetTaskboardSections({
    //     pathParameter : {
    //         task_board_id : selectedTaskboard?.task_board_id
    //     },
    //     pathQuery : {
    //         include_tasks : false
    //     }
    // })

    const {
        mutateAsync : updateTaskPrimitiveFieldsMutateAsync
    } = useUpdateTaskPrimitiveFields()

    const {
        mutateAsync : moveTaskToTrashTrigger,
        isPending : moveTaskToTrashIsPending
    } = useMoveTaskToTrash({
        onSuccess : () => {
            toast.success("Task moved to trash")
            setMoveToTrashReady( false )
            closeHandler()
        }
    })

    const moveTaskToTrashHandler = async () => {
        if ( !task ) return
        await moveTaskToTrashTrigger({
            params : {
                task_id : task.task_id
            }
        })
    }

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
        // setSelectedTaskSection( selectedTask?.task_section_id ?? "" )
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
                showCloseButton={ false }
                className={cn(
                    ` !max-w-screen !max-h-[calc(100vh-4rem)] min-h-0 w-fit h-fit `,
                    ` shadow-none !border-none !bg-card !p-0 !outline-none `
                )}
                onMouseDown={ e => {
                    e.stopPropagation()
                } }
            >
                <div
                    className={cn(
                        // ` absolute bottom-0 right-[1rem] `,
                        ` w-[80rem] h-fit min-h-0 max-h-[calc(100vh-4rem)] `,
                        ` flex flex-col `,
                        ` border border-border rounded-md shadow `,
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
                        isLoadingTask || isFetchingTask ? 
                        <div className=" size-full p-8 flex items-center justify-center min-h-[58.5rem] " >
                            <Spinner size="md"/>
                        </div>
                        :
                        <>
                            {/* Header */}
                            <div
                                className={cn(
                                    ` w-full h-fit p-2 border-b `,
                                    ` flex gap-2 items-center  `,
                                )}
                            >
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    onClick={closeHandler}
                                ><X className=" size-4 " /></Button>
                                <Dialog
                                    open={moveToTrashReady}
                                    onOpenChange={ open => {
                                        setMoveToTrashReady( open )
                                    }}
                                >
                                    <DialogTrigger
                                        render={
                                            <Button
                                                variant={"ghost"}
                                                size={"icon"}
                                                className="ml-auto text-destructive"
                                            >
                                                <Trash2/>
                                            </Button>
                                        }
                                    >
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Move to trash?</DialogTitle>
                                            <DialogDescription>
                                                This task will be moved to the trash. They can still be restored from the trash before 30 days.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant={"destructive"}
                                                disabled={moveTaskToTrashIsPending}
                                                onClick={moveTaskToTrashHandler}
                                            >
                                                { moveTaskToTrashIsPending ? <Spinner/> : "Yes, move to trash" }
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* TODO : Create the task section switcher */}

                                {/* <div
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
                                </div> */}
                            </div>

                            {/* Body */}
                            <div
                                className={cn(
                                    ` relative h-full grid grow `,
                                    ` min-h-0 `
                                )}
                                style={{
                                    gridTemplateColumns : "1fr min-content min-content"
                                }}
                            >
                                {/* Main Body */}
                                <ScrollArea
                                    className="h-full grow min-h-0 rounded-tr-lg "
                                >
                                    <div
                                        className={cn(
                                            `flex flex-col h-full grow `
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                ` p-4 `,
                                                ` flex flex-col gap-4`
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    `w-full flex gap-4 `
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        `w-fit`,
                                                        `p-4 py-2 rounded-md `,
                                                        `bg-primary text-primary-foreground`
                                                    )}
                                                    style={{
                                                        backgroundColor : task?.project_color,
                                                    }}
                                                >
                                                    <p className={cn(
                                                        " text-lg font-semibold ",
                                                        task?.project_color && getHexLuminance(task.project_color ) > 0.4 ? "text-black" : "text-white"
                                                    )} >{task?.project_abbreviation.toUpperCase()}-{task?.task_depth}</p>
                                                </div>
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
                                            </div>
                                            <ContentEditor_TaskboardTaskDialog
                                                content={ task?.task_description === undefined || task?.task_description === null ? "" : task?.task_description }
                                                onContentChange={ setTaskDescription }
                                            />
                                        </div>
                                        <CommentSection_TaskboardTaskDialog
                                            taskId={ task_id! }
                                        />
                                    </div>
                                </ScrollArea>

                                {/* <div className=" w-[1px] bg-border" ></div> */}

                                {/* Right Body */}
                                <div
                                    className={cn(
                                        ` w-[20rem] p-4 `,
                                        ` flex flex-col gap-4 `
                                    )}
                                >
                                    <div
                                        className=" flex justify-between gap-2 p-2 "
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
                                    <div
                                        className=" grid gap-8 p-2 "
                                        style={{
                                            gridTemplateColumns : "min-content 1fr"
                                        }}
                                    >
                                        <p className=" text-sm " >Tags</p>
                                        {
                                            task && (
                                                <TaskTagEditor
                                                    task={ task }
                                                />
                                            )
                                        }
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