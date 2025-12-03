import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDurationString, parseDurationString } from "@/lib/utils/durationFormatter"
import { MakeOptional } from "@/lib/utils/shared"
import { useAddTaskTimeLog } from "@/services/private/task/mutation"
import { TTaskTimeLog } from "@repo/taskprio-types/src/index"
import { Timer } from "lucide-react"
import React, { useMemo, useState } from "react"
import Spinner from "../../Spinner"
import { Badge } from "@/components/ui/badge"
import useGetWorkspaceMemberDetails from "@/lib/hooks/useGetWorkspaceMemberDetails"
import dayjs from "@/lib/dayjs"
import { Progress } from "@/components/ui/progress"

export type TTaskTimerLoggerProps = {
    taskId : string,
    taskEstimate? : number | null,
    timeLogs : MakeOptional<TTaskTimeLog, "created_at">[],
    setTimeLogs : ( timeLogs : MakeOptional<TTaskTimeLog, "created_at">[] ) => void
}

const TaskTimeLogger : React.FC<TTaskTimerLoggerProps> = ({
    taskId,
    taskEstimate,
    timeLogs,
    setTimeLogs
}) => {

    const getWorkspaceMemberDetails = useGetWorkspaceMemberDetails()

    const {
        mutateAsync : addTaskTimeLog,
        isPending : isAddingTaskTimeLog
    } = useAddTaskTimeLog(
        ( data ) => {
            setTimeLogs( [ data, ...timeLogs ])
            setInputValue( "" )
            setTimeSpent( null )
        }
    )

    const [ inputValue, setInputValue ] = useState<string>("")
    const [ timeSpent, setTimeSpent ] = useState<number | null>(null)

    const total_time_spent = useMemo(() => {
        return timeLogs.reduce((acc, log) => acc + log.time_spent, 0)
    }, [ timeLogs ])

    const handleAddTaskTimeLog = async () => {
        if ( timeSpent === null ) return
        await addTaskTimeLog({
            task_id : taskId,
            body : {
                time_spent : timeSpent
            }
        })
    }

    return (
        <div
            className={cn(
                ` flex justify-end `
            )}
        >
            <Popover
                modal={false}
            >
                <PopoverTrigger
                    asChild
                >
                    {
                        timeLogs.length < 1 ? (
                            <div
                                role="button"
                                className={cn(
                                    ` flex items-center gap-2 text-sm text-primary cursor-pointer `,
                                    ` hover:text-primary `
                                )}
                            >
                                <Timer className={` size-[1rem] `} /> Log Time
                            </div>
                        ) : (
                            <div
                                role="button"
                                className={cn(
                                    ` w-full `,
                                    ` flex justify-end items-end flex-col gap-2 `,
                                    ` cursor-pointer `,
                                )}
                            >
                                <Badge>
                                    { formatDurationString( total_time_spent ) }
                                </Badge>
                                {
                                    taskEstimate &&
                                    <Progress
                                        value={ ( total_time_spent / taskEstimate ) * 100 }
                                    />
                                }
                            </div>
                        )
                    }
                </PopoverTrigger>
                <PopoverContent
                    noPortal
                >
                    <div
                        className=" flex flex-col gap-2 "
                    >
                        <div
                            className=" flex flex-col gap-4 "
                        >
                            <Input
                                placeholder="Enter time spent"
                                value={inputValue}
                                onChange={ e => {
                                    const value = e.target.value
                                    setInputValue( value )
                                    setTimeSpent( parseDurationString( value ) )
                                } }
                            />
                            <Button
                                disabled={isAddingTaskTimeLog || timeSpent === null}
                                onClick={handleAddTaskTimeLog}
                            >
                                {
                                    isAddingTaskTimeLog &&
                                    <Spinner size="sm" />
                                }
                                {
                                    !isAddingTaskTimeLog &&
                                    "Add"
                                }
                            </Button>
                        </div>
                        <p className=" text-sm " >Logs</p>
                        <div
                            className={cn(
                                ` h-fit max-h-[14rem] overflow-y-auto `,
                                ` flex flex-col gap-1 `
                            )}
                        >
                            {
                                timeLogs.length < 1 &&
                                <p className=" text-center text-sm text-muted-foreground " >No Time Logs</p>
                            }
                            {
                                timeLogs.map((log, logIndex) => (
                                    <div
                                        key={logIndex}
                                        className=" flex justify-between items-center "
                                    >
                                        <div
                                            className=" flex flex-col "
                                        >
                                            <p className=" text-sm " >{ getWorkspaceMemberDetails( log.user_id )?.firstname ?? "Unknown" } { getWorkspaceMemberDetails( log.user_id )?.lastname ?? "" }</p>
                                            <p className=" text-xs text-muted-foreground " >{ dayjs.utc( log.created_at ).fromNow() }</p>
                                        </div>
                                        <Badge variant={"outline"} >
                                            { formatDurationString( log.time_spent ) }
                                        </Badge>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </PopoverContent>
            </Popover>
        </div>
    )

}

export default TaskTimeLogger