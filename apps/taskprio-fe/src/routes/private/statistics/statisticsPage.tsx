import SessionHistoryTab from "@/components/others/dashboard/SessionHistoryTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const StatisticsPage = () => {

    return (
        <Tabs
            defaultValue={"session_history"}
            className={cn(
                `grow size-full min-h-0 gap-0`
            )}
        >
            <div
                className={cn(
                    `p-4`
                )}
            >
                <TabsList variant={"line"} >
                    <TabsTrigger value={"time_report"}>Time Report</TabsTrigger>
                    <TabsTrigger value={"session_history"}>Session History</TabsTrigger>
                </TabsList>
            </div>
            <SessionHistoryTab/>
        </Tabs>
    )

}

export default StatisticsPage;