import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TSessionHistoryWithTaskTodoStateSnapshots } from "@repo/taskprio-types/src";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import TaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTab from "./TaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTab";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import UserAvatar from "../shared/UserAvatar";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type TSessionHistoryCard_SessionHistoryTabProps = {
    data : TSessionHistoryWithTaskTodoStateSnapshots
}

const SessionHistoryCard_SessionHistoryTab : React.FC<TSessionHistoryCard_SessionHistoryTabProps> = ({
    data
}) => {

    const totalWorkTime = useMemo(() => {
        return data.snapshots.reduce( (acc, curr) => {
            return acc + curr.timers.reduce( (acc2, curr2) => {
                const start = dayjs(curr2.start)
                const stop = dayjs(curr2.stop)
                return acc2 + stop.diff( start, "second" )
            }, 0 )
        }, 0 )
    }, [data])

    const totalWorkTimeGoal = useMemo(() => {
        return data.snapshots.reduce( (acc, curr) => {
            return acc + Number(curr.work_time_goal)
        }, 0 )
    }, [data])

    return (
        <AccordionItem
            value={data.task_todo_session_history_id}
            className={cn(
                `group`,
                `relative w-full h-fit`,
                `bg-card border border-border rounded-md`,
                `first:rounded-b-none`,
                `not-first:rounded-none not-first:border-t-0`,
                `last:rounded-b-md`
                // "hover:bg-gradient-to-r hover:from-primary/10 hover:to-card/10"
            )}
        >
            <div className={cn(
                `absolute top-0 left-0 size-full bg-transparent rounded-md overflow-hidden`,
                `group-first:rounded-b-none`,
                `group-not-first:rounded-none`,
                `group-last:rounded-b-md`
            )} >
                <div
                    className={cn(
                        `absolute top-0 left-0`,
                        `size-full -translate-x-full`,
                        `bg-gradient-to-r from-primary/10 to-transparent`,
                        `transition-transform ease-in duration-[300ms]`,
                        `group-hover:translate-x-0 `
                    )}
                ></div>
            </div>
            <AccordionTrigger
                disableUnerline
                render={
                    <div
                        className="relative flex justify-between !items-center space-x-4 !p-2 pl-4 overflow-hidden"
                    >

                        <div className="flex items-center space-x-4" >
                            <UserAvatar user_id_or_email={data.user_id} size="md" />
                            <Badge variant={"outline"} >{data.snapshots.filter( snapshot => snapshot.completed ).length}/{data.snapshots.length}</Badge>
                            <NumberFlowGroup>
                                <div className={cn(
                                    "text-lg font-bold",
                                    totalWorkTime < totalWorkTimeGoal ? `text-green-400` : `text-destructive`
                                )} >
                                    <NumberFlow
                                        animated={false}
                                        value={ Math.floor( totalWorkTime / 3600 ) }
                                        />
                                    <NumberFlow
                                        animated={false}
                                        prefix=":"
                                        value={Math.floor((totalWorkTime % 3600) / 60)}
                                        digits={{ 1: { max: 5 } }}
                                        format={{ minimumIntegerDigits: 2 }}
                                        />
                                    <NumberFlow
                                        animated={false}
                                        prefix=":"
                                        value={totalWorkTime % 60}
                                        digits={{ 1: { max: 5 } }}
                                        format={{ minimumIntegerDigits: 2 }}
                                        />
                                </div>
                            </NumberFlowGroup>
                            <span>-</span>
                            <NumberFlowGroup>
                                <div className="text-lg font-bold text-muted-foreground text-nowrap" >
                                    <NumberFlow
                                        animated={false}
                                        value={ Math.floor( totalWorkTimeGoal / 3600 ) }
                                        />
                                    <NumberFlow
                                        animated={false}
                                        prefix=":"
                                        value={Math.floor((totalWorkTimeGoal % 3600) / 60)}
                                        digits={{ 1: { max: 5 } }}
                                        format={{ minimumIntegerDigits: 2 }}
                                        />
                                </div>
                            </NumberFlowGroup>
                        </div>
                        <div className="flex items-center space-x-2" >
                            <Badge variant={"ghost"} >{dayjs.utc(data.created_at).fromNow()}</Badge>
                            <span>-</span>
                            <Badge variant={"secondary"} >{dayjs(data.created_at).format("MMM D, YYYY hh:mm:ss A")}</Badge>
                        </div>
                    </div>
                }
            />

            <AccordionContent
                className={cn(
                    `flex flex-nowrap space-x-4 p-4 pt-0`,
                    `overflow-x-auto`
                )}
            >
                {
                    data.snapshots.map( snapshot => (
                        <TaskTodoStateSnapshot_SessionHistoryCard_SessioHistoryTab key={snapshot.task_todo_state_snapshot_id} data={snapshot} />
                    ) )
                }
            </AccordionContent>
        </AccordionItem>
    )

}

export default SessionHistoryCard_SessionHistoryTab;