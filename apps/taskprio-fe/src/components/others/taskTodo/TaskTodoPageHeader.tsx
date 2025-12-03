import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { updateGlobalsStore, useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { Menu } from "lucide-react";


const TaskTodoPageHeader = () => {

    const sidebar = useSidebar()
    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()
    
    return (
        <div
            className={cn(
                `flex items-center gap-4`,
                `p-4`
            )}
            style={{
                gridColumn : "1/3"
            }}
        >
            {
                sidebar.isMobile &&
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                        sidebar.toggleSidebar()
                    }}
                >
                    <Menu/>
                </Button>
            }
            <div className=" flex items-center gap-4 " >
                <Switch
                    id="taskTodoPageShowAvailableTasks"
                    checked={taskTodoPageShowAvailableTasks}
                    onCheckedChange={ checked => {
                        updateGlobalsStore({
                            taskTodoPageShowAvailableTasks : checked
                        })
                    } }
                />
                <Label htmlFor="taskTodoPageShowAvailableTasks" >Show Available Tasks</Label>   
            </div>
        </div>
    )

}

export default TaskTodoPageHeader;