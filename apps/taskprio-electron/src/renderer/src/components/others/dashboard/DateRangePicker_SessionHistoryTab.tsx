import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { updateSessionHistoryTabStore, useSessionHistoryTabStore_dateRange } from "@/stores/sessionHistoryTab";
import { DateRange } from "react-day-picker";

const DateRangePicker_SessionHistoryTab = () => {

    const dateRange = useSessionHistoryTabStore_dateRange()

    const onValueChange = (value: DateRange | undefined) => {
        updateSessionHistoryTabStore({
            dateRangeState: -1,
            dateRange: value ? [
                dayjs(value.from).endOf("day").toISOString(),
                dayjs(value.to ?? value.from).startOf("day").toISOString()
            ] : []
        })
    }

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant={"outline"}
                    >
                        {
                            (dateRange[0] && dateRange[1]) ?
                                `${dayjs(dateRange[0]).format("DD MMM YYYY")} - ${dayjs(dateRange[1]).format("DD MMM YYYY")}` :
                                "Select Date Range"
                        }
                    </Button>
                }
            />
            <PopoverContent
                className={cn(
                    `w-fit`
                )}
            >
                <Calendar
                    mode="range"
                    showOutsideDays={false}
                    numberOfMonths={2}
                    onSelect={onValueChange}
                    selected={{
                        from: dateRange[0] ? dayjs(dateRange[0]).toDate() : undefined,
                        to: dateRange[1] ? dayjs(dateRange[1]).toDate() : undefined
                    }}
                />
            </PopoverContent>
        </Popover>
    )

}

export default DateRangePicker_SessionHistoryTab;