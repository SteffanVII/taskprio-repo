import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
import { Menu, Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const MainDashboardHeader = () => {

    const { pathname } = useLocation()
    const navigate = useNavigate()

    const sidebar = useSidebar()
    
    const projectRoute = useMemo(() => {
        if ( pathname.includes("/t") ) {
            return "boards"
        }
        if ( pathname.includes("/project_settings/") || pathname.includes("/project_settings") ) {
            return "project_settings"
        }
    }, [ pathname ])

    return (
        <>
            <div
                className={cn(
                    ` relative w-full p-3 `,
                    ` flex items-center gap-4 bg-muted `
                )}
            >
                {
                    // Show sidebar button when in mobile mode
                    sidebar.isMobile &&
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => {
                            sidebar.toggleSidebar()
                        }}
                    ><Menu/></Button>
                }
                <Tabs
                    value={projectRoute}
                >
                    <TabsList className="border z-10">
                        <TabsTrigger
                            value="boards"
                            onClick={() => {
                                navigate(`t`)
                            }}
                        >Boards</TabsTrigger>
                        <TabsTrigger
                            value="project_settings"
                            onClick={() => {
                                navigate( "project_settings" )
                            }}
                        >
                            <Tooltip>
                                <TooltipTrigger render={
                                    <div>
                                        <Settings2/>
                                    </div>
                                }/>
                                <TooltipContent
                                    side="bottom"
                                >
                                    Project Settings
                                </TooltipContent>
                            </Tooltip>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className=" ml-auto " ></div>
            </div>
        </>
    )

}

export default MainDashboardHeader;