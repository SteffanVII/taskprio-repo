import { Badge } from "@/components/ui/badge"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { formatTaskTodoTimeSeconds } from "@/lib/utils/durationFormatter"
import { TTaskTodoStateSnapshotWithTimers } from "@repo/taskprio-types"
import React, { useMemo } from "react"

type TTaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTabProps = {
    data: TTaskTodoStateSnapshotWithTimers
}

const TaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTab: React.FC<TTaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTabProps> = ({
    data
}) => {

    const totalWorkTime = useMemo(() => {
        if (data.timers.length > 0) {
            return data.timers.reduce((acc, curr) => {
                if (curr.start && curr.stop) {
                    const start = dayjs(curr.start)
                    const stop = dayjs(curr.stop)
                    return acc + stop.diff(start, "second")
                }
                return acc
            }, 0)
        }
        return 0
    }, [data.timers])

    return (
        <Item
            variant={"muted"}
            size={"sm"}
            className={cn(
                `w-fit border border-muted shadow-2xl`,
                data.completed ? `border-green-400/40 bg-green-400/10` : undefined,
                // (totalWorkTime > 0 && totalWorkTime > Number(data.work_time_goal)) ? `bg-destructive/10` : `bg-green-400/10`
            )}
        >
            <ItemContent className="gap-2" >
                <div className="flex items-center gap-4" >
                    <Badge variant={"outline"} >{data.project_abbreviation}-{data.task_depth}</Badge>
                    <ItemTitle title={data.task_title} className="max-w-[5rem] text-nowrap overflow-hidden text-ellipsis" >{data.task_title}</ItemTitle>
                </div>
                <div className="flex items-center space-x-2" >
                    <span
                        className={cn(
                            `text-lg font-bold text-nowrap`,
                            totalWorkTime > 0 ? (totalWorkTime > Number(data.work_time_goal)) ? `text-destructive` : `text-green-400` : undefined
                        )}
                    >{formatTaskTodoTimeSeconds(totalWorkTime)}</span>
                    <span className="text-lg font-bold" >/</span>
                    <span className="text-lg font-bold text-nowrap" >{formatTaskTodoTimeSeconds(Number(data.work_time_goal))}</span>
                </div>
            </ItemContent>
        </Item>
    )
}

export default TaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTab