import { cn } from "@/lib/utils"
import { Button } from "../../ui/button";
import { Sun } from "lucide-react";
import ProjectsList_MainDashboardPane from "./ProjectsList_MainDashboardPane";
import WorkspaceDropdown_MainDashboardPane from "./WorkspaceDropdown_MainDashboardPane";
import GeneralButtons from "./GeneralButtons_MainDashboardPane";
import { useTheme } from "@/lib/utils/themeProvider";
import TodoCard_MainDashboardPane from "./TodoCard_MainDashboardPane";
import UserPopoverMenu from "../mainDashboardHeader/UserPopoverMenu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useGlobalsStore_noWorkspaces } from "@/stores/globals";
import { useElectronStore_isElectron } from "@/stores/electron";

const MainDashboardPane = () => {

    const {
        theme,
        setTheme
    } = useTheme()

    const isElectron = useElectronStore_isElectron()
    const noWorkspaces = useGlobalsStore_noWorkspaces()

    return (
        <>
            <Sidebar
                variant="inset"
                electron={isElectron}
            >
                {
                    !noWorkspaces ?
                    <>
                        <SidebarHeader className="p-2" >
                            <WorkspaceDropdown_MainDashboardPane/>
                        </SidebarHeader>
                        <SidebarContent>
                            <GeneralButtons/>
                            <ProjectsList_MainDashboardPane/>
                        </SidebarContent>
                    </>
                    :
                    <p className="font-semibold text-lg m-auto" >No Workspaces Found</p>
                }
                <SidebarFooter className="mt-auto" >
                    <TodoCard_MainDashboardPane/>
                    <div
                        className={cn(
                            ` w-full p-2 `,
                            ` flex items-center justify-between gap-2 `
                        )}
                    >
                        <UserPopoverMenu/>
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() => {
                                setTheme( theme === "dark" ? "light" : "dark" )
                            }}
                        >
                            <Sun className=" size-4 "/>
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
            {/* <div
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
                    <WorkspaceDropdown_MainDashboardPane/>
                </div>

                Header
                
                <GeneralButtons/>

                <div
                    className={cn(
                        ` flex flex-col grow gap-2 p-2 overflow-y-auto overflow-x-hidden `
                    )}
                >
                    <ProjectsList_MainDashboardPane/>
                </div>

                Footer

                <div
                    className={cn(
                        `w-full mt-auto`
                    )}
                >

                    <TodoCard_MainDashboardPane/>

                    <div
                        className={cn(
                            ` w-full p-4 `,
                            ` flex items-center justify-between gap-2 `
                        )}
                    >
                        <UserPopoverMenu/>
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() => {
                                setTheme( theme === "dark" ? "light" : "dark" )
                            }}
                        >
                            <Sun className=" size-4 "/>
                        </Button>
                    </div>
                </div>
            </div> */}
        </>
    )

}

export default MainDashboardPane;