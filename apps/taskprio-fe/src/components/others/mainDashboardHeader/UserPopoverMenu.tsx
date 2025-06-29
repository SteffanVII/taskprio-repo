import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import LogoutTrigger from "../shared/LogoutTrigger";

const UserPopoverMenu = () => {

    
    return (
        <Popover>
            <PopoverTrigger asChild >
                <span
                    onClick={ e => {
                        e.stopPropagation()
                    } }
                    className={cn(
                        ` flex size-[2em] rounded-full bg-gray-400 cursor-pointer `
                    )}
                >
                </span>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    ` max-w-[100dvw] h-fit `
                )}
            >
                <div
                    className={cn(
                        ` flex flex-col `
                    )}
                >
                    <LogoutTrigger>
                        <Button
                            variant={"ghost"}
                            className=" w-full flex items-center justify-between "
                        >Logout <LogOut className="size-4" /></Button>
                    </LogoutTrigger>
                </div>
            </PopoverContent>
        </Popover>
    )

}

export default UserPopoverMenu;