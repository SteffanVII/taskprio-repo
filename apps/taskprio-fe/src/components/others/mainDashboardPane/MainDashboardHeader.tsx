import { cn } from "@/lib/utils";
import { useGlobalsStore } from "@/stores/globals";
import UserPopoverMenu from "../mainDashboardHeader/UserPopoverMenu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
                    ` flex items-center `,
                )}
            >
                <Tabs>
                    <TabsList>
                        <TabsTrigger value="boards">Boards</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>
                </Tabs>
                {/* {
                    selectedProject &&
                    <h3 className=" text-lg font-medium " >{selectedProject.project_name}</h3>
                } */}
                <div className=" ml-auto " ></div>
                <UserPopoverMenu/>
            </div>
        }
        </>
    )

}

export default MainDashboardHeader;