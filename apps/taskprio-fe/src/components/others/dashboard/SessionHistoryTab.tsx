import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGetWorkspaceSessionHistories } from "@/services/private/todo/query";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import SessionHistoryCard_SessionHistoryTab from "./SessionHistoryCard_SessionHistoryTab";
import { Accordion } from "@/components/ui/accordion";
import { updateSessionHistoryTabStore, useSessionHistoryTabStore_dateRange, useSessionHistoryTabStore_dateRangeState, useSessionHistoryTabStore_selectedMembers } from "@/stores/sessionHistoryTab";
import dayjs from "dayjs";
import MemberSelector_SessionHistoryTab from "./MemberSelector_SessionHistoryTab";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DateRangePicker_SessionHistoryTab from "./DateRangePicker_SessionHIstoryTab";

const SessionHistoryTab = () => {

    const selectedworkspace = useGlobalsStore_selectedWorkspace()
    const dateRangeState = useSessionHistoryTabStore_dateRangeState()
    const dateRange = useSessionHistoryTabStore_dateRange()
    const selectedMembers = useSessionHistoryTabStore_selectedMembers()

    const {
        data : sessionHistories,
    } = useGetWorkspaceSessionHistories(
        {
            query : {
                workspace_id : selectedworkspace?.workspace_id,
                user_ids : selectedMembers,
                date_range : dateRange
            }
        },
        {
            enabled : !!selectedworkspace?.workspace_id
        }
    )

    const handleFixedRangeButtonOnClick = ( days : number ) => {
        if ( days === 0 ) {
            updateSessionHistoryTabStore({ dateRangeState : days, dateRange : [] })
        } else if ( days === 1 ) {
            updateSessionHistoryTabStore({ dateRangeState : days, dateRange : [ dayjs().endOf("day").toISOString(), dayjs().startOf("day").toISOString() ] })
        } else {
            updateSessionHistoryTabStore({ dateRangeState : days, dateRange : [ dayjs().endOf("day").toISOString(), dayjs().subtract(days, "day").startOf("day").toISOString() ] })
        }
    }

    return (
        <TabsContent
            value={"session_history"}
            className={cn(
                `grid`,
                `size-full min-h-0`
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <div
                className={cn(
                    `flex gap-4`,
                    `p-2 px-4`
                )}
            >
                <ToggleGroup
                    variant={"outline"}
                    value={[dateRangeState.toString()]}
                    onValueChange={ value => {
                        handleFixedRangeButtonOnClick(Number(value[0]))
                    } }
                >
                    <ToggleGroupItem value={"1"} >Today</ToggleGroupItem>
                    <ToggleGroupItem value={"7"} >Last 7 days</ToggleGroupItem>
                    <ToggleGroupItem value={"31"} >Last 31 days</ToggleGroupItem>
                    <ToggleGroupItem value={"63"} >6M</ToggleGroupItem>
                    <ToggleGroupItem value={"365"} >1Y</ToggleGroupItem>
                    <ToggleGroupItem value={"0"} >All time</ToggleGroupItem>
                </ToggleGroup>
                <DateRangePicker_SessionHistoryTab/>
                <MemberSelector_SessionHistoryTab/>
            </div>

            {
                (sessionHistories && sessionHistories.length === 0) &&
                <div className="size-full min-h-0 flex justify-center items-center" >
                    <p className="font-bold text-2xl text-muted-foreground text-center" >No session history found</p>
                </div>
            }
            {
                (sessionHistories && sessionHistories.length > 0) &&
                <Accordion
                    multiple
                    className={cn(
                        `flex flex-col p-4`,
                        `overflow-x-hidden`
                    )}
                >
                    {
                        sessionHistories && sessionHistories.map( sessionHistory => <SessionHistoryCard_SessionHistoryTab data={sessionHistory} /> )
                    }
                </Accordion>
            }
        </TabsContent>
    )

}

export default SessionHistoryTab;