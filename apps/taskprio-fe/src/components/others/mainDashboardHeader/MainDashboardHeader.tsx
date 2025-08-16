import { cn } from "@/lib/utils";
import { useGlobalsStore } from "@/stores/globals";
import UserPopoverMenu from "./UserPopoverMenu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
import { Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const MainDashboardHeader = () => {

    const { pathname } = useLocation()
    const navigate = useNavigate()

    const {
        selectedProject
    } = useGlobalsStore()

    const projectRoute = useMemo(() => {
        if ( pathname.includes("/t/") ) {
            return "boards"
        }
        if ( pathname.includes("/project_settings/") || pathname.includes("/project_settings") ) {
            return "project_settings"
        }
    }, [ pathname ])

    return (
        <>
        {
            selectedProject &&
            <div
                className={cn(
                    ` w-full p-3 `,
                    ` flex items-center gap-4 `,
                )}
            >
                {
                    selectedProject &&
                    <>
                        <h3 className=" text-lg font-medium " >{selectedProject.project_name}</h3>
                        <Tabs
                            value={projectRoute}
                        >
                            <TabsList>
                                <TabsTrigger
                                    value="boards"
                                    onClick={() => {
                                        navigate(`t`)
                                    }}
                                >Boards</TabsTrigger>
                                <TabsTrigger
                                    value="project_settings"
                                    onClick={() => {
                                        // navigate( pathname.replace(/\/t\/.*/, "/project_settings") )
                                        navigate( "project_settings" )
                                    }}
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild >
                                            <div>
                                                <Settings2/>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                        >
                                            Project Settings
                                        </TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </>
                }
                <div className=" ml-auto " ></div>
                <UserPopoverMenu/>
            </div>
        }
        </>
    )

}

export default MainDashboardHeader;