import { Sheet, SheetContent } from "@/components/ui/sheet";
import { updateGlobalsStore, useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";


const AvailableTaskSectionsSheet = () => {

    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()

    return (
        <Sheet
            open={taskTodoPageShowAvailableTasks}
            onOpenChange={ () => {
                updateGlobalsStore({
                    taskTodoPageShowAvailableTasks : !taskTodoPageShowAvailableTasks
                })
            } }
        >
            <SheetContent>

            </SheetContent>
        </Sheet>
    )

}

export default AvailableTaskSectionsSheet;