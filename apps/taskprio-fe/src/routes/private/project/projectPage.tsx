import { cn } from "@/lib/utils";
import { Outlet, useParams } from "react-router";


const ProjectPage = () => {

    const {
        project_slug
    } = useParams()

    return (
        <div
            className={cn(
                ` grow bg-accent `
            )}
        >
            <Outlet/>
        </div>
    )

}

export default ProjectPage;