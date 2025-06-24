import { cn } from "@/lib/utils";
import { useGlobalsStore } from "@/stores/globals";


const MainDashboardHeader = () => {

    const {
        selectedProject
    } = useGlobalsStore()

    return (
        <>
        {
            selectedProject &&
            <div
                className={cn(
                    ` w-full p-3 `,
                    ` border-b border-border `
                )}
            >
                {
                    selectedProject &&
                    <h3 className=" text-lg font-medium " >{selectedProject.project_name}</h3>
                }
            </div>
        }
        </>
    )

}

export default MainDashboardHeader;