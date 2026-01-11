import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import LogoutTrigger from "../shared/LogoutTrigger";
import { useGlobalsStore_user } from "@/stores/globals";

import { Separator } from "@/components/ui/separator";
import UserAvatar from "../shared/UserAvatar";
import { updateDialogsStore } from "@/stores/dialogs";

const UserPopoverMenu = () => {

    // const navigate = useNavigate()

    const user = useGlobalsStore_user()

    return (
        <Popover>
            <PopoverTrigger>
                <UserAvatar
                    user_id_or_email={user?.email || ""}
                    disableHoverCard={true}
                />
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
                            ` flex flex-col p-2 rounded-md `,
                            ` transition-colors cursor-pointer `,
                            ` hover:bg-muted `
                        )}
                        onClick={() => {
                            // navigate("/p/profile")
                            updateDialogsStore({
                                profileDialog: {
                                    open: true
                                }
                            })
                        }}
                    >
                        <p className=" font-medium " >{user?.firstname} {user?.lastname}</p>
                        <p className=" text-sm text-muted-foreground " >{user?.email}</p>
                    </div>
                    <Separator />
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