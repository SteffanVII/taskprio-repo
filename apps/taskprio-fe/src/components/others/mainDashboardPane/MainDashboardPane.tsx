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
                electron={isElectron}
                className=" z-10 overflow-hidden"
            >
                {
                    !noWorkspaces ?
                        <>
                            <SidebarHeader className="p-2 pb-0" >
                                <WorkspaceDropdown_MainDashboardPane />
                            </SidebarHeader>
                            <SidebarContent>
                                <GeneralButtons />
                                <ProjectsList_MainDashboardPane />
                            </SidebarContent>
                        </>
                        :
                        <p className="font-semibold text-lg m-auto" >No Workspaces Found</p>
                }
                <SidebarFooter className="mt-auto" >
                    <TodoCard_MainDashboardPane />
                    <div
                        className={cn(
                            ` w-full p-2 `,
                            ` flex items-center justify-between gap-2 z-20 `,
                        )}
                    >
                        <UserPopoverMenu />
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() => {
                                setTheme(theme === "dark" ? "light" : "dark")
                            }}
                        >
                            <Sun className=" size-4 " />
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
        </>
    )

}

export default MainDashboardPane;