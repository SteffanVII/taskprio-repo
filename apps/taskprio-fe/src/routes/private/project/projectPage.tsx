import MainDashboardHeader from "@/components/others/mainDashboardHeader/MainDashboardHeader";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router";


const ProjectPage = () => {

    return (
        <>
            <MainDashboardHeader/>  
            <div
                className={cn(
                    ` grow bg-accent `
                )}
            >
                <Outlet/>
            </div>
        </>
    )

}

export default ProjectPage;