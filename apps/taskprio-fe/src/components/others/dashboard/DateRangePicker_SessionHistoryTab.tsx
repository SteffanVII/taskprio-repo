import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DateRangePicker_SessionHistoryTab = () => {

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant={"outline"}
                    >Select Date Range</Button>
                }
            />
            <PopoverContent
                className={cn(
                    `w-fit`
                )}
            >
                <Calendar
                    mode="range"
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    )

}

export default DateRangePicker_SessionHistoryTab;