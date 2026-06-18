import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useGlobalsStore, useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";

const TaskTodoPageHeader = () => {

  const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()
  const setTaskTodoPageShowAvailableTasks = useGlobalsStore(state => state.setTaskTodoPageShowAvailableTasks)

  return (
    <div
      className={cn(
        `size-full w-full grid items-center`,
        `px-4`
      )}
      style={{
        gridTemplateColumns: "min-content 1fr"
      }}
    >
      <div className="flex gap-4 items-center" >
        <Switch
          id="taskTodoPageShowAvailableTasks"
          checked={taskTodoPageShowAvailableTasks}
          onCheckedChange={checked => {
            setTaskTodoPageShowAvailableTasks(checked)
          }}
        />
        <Label htmlFor="taskTodoPageShowAvailableTasks" className="text-nowrap" >Show Available Tasks</Label>
      </div>
      <div className="electron-custom-titlebar-drag-area size-full min-w-0" ></div>
    </div>
  )

}

export default TaskTodoPageHeader;