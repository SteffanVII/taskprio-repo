import { cn } from "@/lib/utils"
import { Button } from "../../ui/button";
import { LogOut, Mail, Sun } from "lucide-react";
import ProjectsList_MainDashboardPane from "./ProjectsList_MainDashboardPane";
import WorkspaceDropdown_MainDashboardPane from "./WorkspaceDropdown_MainDashboardPane";
import { useLogout } from "@/lib/hooks/useLogout";
import { updateDialogsStore } from "@/stores/dialogs";
import GeneralButtons from "./GeneralButtons_MainDashboardPane";

const MainDashboardPane = () => {

    const logout = useLogout()

    return (
        <div
            className={cn(
                ` w-[20rem] min-w-[20rem] h-full max-h-screen overflow-y-auto overflow-x-hidden `,
                ` flex flex-col justify-between `,
                ` border-r border-border `,
                ` bg-accent/25 `
            )}
        >
            <div
                className={cn(
                    ` p-4 `
                )}
            >
                {/* <h1
                    className={cn(
                        ` text-2xl font-bold `
                    )}
                >
                    Taskprio
                </h1> */}
                <WorkspaceDropdown_MainDashboardPane/>
            </div>

            {/* Header */}
            
            <GeneralButtons/>

            <div
                className={cn(
                    ` flex flex-col grow gap-2 p-2 overflow-y-auto overflow-x-hidden `
                )}
            >
                <ProjectsList_MainDashboardPane/>
            </div>

            {/* Footer */}

            <div
                className={cn(
                    ` w-full p-4 mt-auto `,
                    ` flex items-center justify-between gap-2 `
                )}
            >
                <div className=" flex items-center gap-2 " >
                    <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={logout}
                    ><LogOut className=" size-4 "/> Logout</Button>
                    <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => {
                            updateDialogsStore({
                                workspaceInvitationDialog : {
                                    open : true
                                }
                            })
                        }}  
                    >
                        <Mail className=" size-4 "/>
                        Invite
                    </Button>
                </div>
                <Button
                    size={"icon"}
                    variant={"outline"}
                >
                    <Sun className=" size-4 "/>
                </Button>
            </div>

        </div>
    )

}

export default MainDashboardPane;