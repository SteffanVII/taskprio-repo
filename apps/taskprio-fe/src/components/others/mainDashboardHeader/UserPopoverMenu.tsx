import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import LogoutTrigger from "../shared/LogoutTrigger";
import { useGlobalsStore } from "@/stores/globals";
import { Separator } from "@/components/ui/separator";

const UserPopoverMenu = () => {

    const {
        user
    } = useGlobalsStore()

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
                        ` flex flex-col space-y-4 `
                    )}
                >
                    <div
                        className={cn(
                            ` flex flex-col gapspace-y-2 `
                        )}
                    >
                        <p className=" font-medium " >{user?.firstname} {user?.lastname}</p>
                        <p className=" text-sm text-muted-foreground " >{user?.email}</p>
                    </div>
                    <Separator/>
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