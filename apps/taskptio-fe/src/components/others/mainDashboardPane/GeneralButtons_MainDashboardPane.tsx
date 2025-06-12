import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { Settings2, Timer } from "lucide-react";


const GeneralButtons = () => {

    return (
        <div
            className={cn(
                ` flex flex-col gap-1 px-2 `
            )}
        >
            <Button
                variant={"ghost"}
                className={cn(
                    ` w-full justify-start gap-4 `
                )}
            >
                <Settings2/>
                Workspace
            </Button>
            <Button
                variant={"ghost"}
                className={cn(
                    ` w-full justify-start gap-4 `
                )}
            >
                <Timer/>
                Task Timer
            </Button>
        </div>
    )

}

export default GeneralButtons;