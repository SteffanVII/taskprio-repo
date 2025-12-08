import MainDashboardHeader from "@/components/others/mainDashboardHeader/MainDashboardHeader";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router";

const ProjectPage = () => {

    return (
        <div
            className={cn(
                `relative`,
                `size-full min-w-0 min-h-0 max-w-full overflow-hidden`,
                `grid grow`
            )}
            style={{
                gridTemplateRows : "min-content 1fr"
            }}
        >
            <MainDashboardHeader/>
            {/* <div
                className={cn(
                    `relative max-h-full min-h-0 grow bg-accent `
                )}
            >
            </div> */}
            <Outlet/>
        </div>
    )

}

export default ProjectPage;