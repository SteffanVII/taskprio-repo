import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetProjectTaskboards } from "@/services/private/taskboard/query";
import { useDialogsStore } from "@/stores/dialogs";
import { TTaskboard } from "@repo/taskprio-types";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import React from "react";


const TaskboardsSection = () => {

  const setCreateTaskboardDialog = useDialogsStore(state => state.setCreateTaskboardDialog)

  const handleCreateTaskboardOnClick = () => {
    setCreateTaskboardDialog(true)
  }

  const {
    data : taskboards,
    isLoading : taskboardsIsLoading
  } = useGetProjectTaskboards()

  return (
    <section
      className={cn(" space-y-4")}
    >
      <div
        className={cn(
          "flex items-center gap-4"
        )}
      >
        <h3 className={cn("text-lg font-medium")} >Taskboards</h3>
        <Button size={"icon"} variant={"outline"} onClick={handleCreateTaskboardOnClick} ><Plus/></Button>
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-4"
        )}
      >
        {
          taskboardsIsLoading &&
          Array.from({ length: 6 }).map( (_,index) => <Skeleton key={index} className={cn("w-[10rem] h-[4rem] bg-card")} /> )
        }
        {taskboards && taskboards.map((taskboard) => (
          <TaskboardCard key={taskboard.task_board_id} data={taskboard} />
        ))}
      </div>
    </section>
  )

}

export default TaskboardsSection;

type TTaskboardCardProps = {
  data: TTaskboard
}

const TaskboardCard : React.FC<TTaskboardCardProps> = ({
  data
}) => {

  const navigate = useNavigate()

  const handleOnClick = () => {
    navigate({
      from : "/workspace/$workspace_id/project/$project_id/",
      to : "/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id",
      params : {
        taskboard_id : data.task_board_id
      }
    })
  }

  return (
    <Card
      size="sm"
      className={cn(
        "p-4",
        "border border-transparent hover:border-border hover:shadow-lg",
        "hover:-translate-y-1",
        "transition-all",
        "cursor-pointer"
      )}
      onClick={handleOnClick}
    >
      <p
        className={cn(
          "text-lg font-bold"
        )}
      >{data.task_board_name}</p>
    </Card>
  )

}