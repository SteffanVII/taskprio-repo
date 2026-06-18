import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import React, { useState } from "react";
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard";

import { ArchiveRestore, Trash2, Undo2 } from "lucide-react";
import { useGetTaskboardTrashTasks } from "@/services/private/taskboard/query";
import Spinner from "../Spinner";
import { TTaskPrimitive } from "@repo/taskprio-types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRestoreTaskFromTrash } from "@/services/private/task/mutation";
import { toast } from "sonner";
import { useDialogsStore, useDialogsStore_taskboardTaskTrashSheet } from "@/stores/dialogs";

const TaskboardTrashSheet = () => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  const setTaskboardTaskTrashSheet = useDialogsStore(state => state.setTaskboardTaskTrashSheet)

  const {
    open
  } = useDialogsStore_taskboardTaskTrashSheet()

  const {
    data: taskboardTrashTasks,
    isLoading: taskboardTrashTasksIsLoading
  } = useGetTaskboardTrashTasks({
    payload: {
      params: {
        taskboard_id: selectedTaskboard?.task_board_id
      }
    },
    options: {
      enabled: open
    }
  })

  const {
    mutateAsync: restoreTaskFromTrash,
    isPending: restoreTaskFromTrashIsPending
  } = useRestoreTaskFromTrash({
    onSuccess: () => {
      toast.success("Task restored")
      setTrashToRestore(null)
    }
  })

  const [trashToRestore, setTrashToRestore] = useState<TTaskPrimitive | null>(null)

  const handleRestoreTask = async () => {
    if (!trashToRestore || !selectedTaskboard) return
    await restoreTaskFromTrash({
      params: {
        task_id: trashToRestore.task_id,
        taskboard_id: selectedTaskboard.task_board_id
      }
    })
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(open) => {
          setTaskboardTaskTrashSheet(open)
        }}
      >
        <SheetContent
          className="grid min-h-0"
          style={{
            gridTemplateRows: "min-content 1fr"
          }}
        >
          <SheetHeader>
            <SheetTitle className="flex gap-2 items-center" ><Trash2 className="size-4 text-destructive" /> {selectedTaskboard?.task_board_name} trash</SheetTitle>
          </SheetHeader>
          {
            taskboardTrashTasksIsLoading &&
            <div className="w-full py-[4rem] flex items-center justify-center" >
              <Spinner size="xl" />
            </div>
          }
          {
            (!taskboardTrashTasksIsLoading && taskboardTrashTasks) &&
            <ScrollArea
              className={cn(
                `min-h-0`,
                `px-4`
              )}
            >
              <div
                className={cn(
                  `flex flex-col gap-2`
                )}
              >
                {
                  taskboardTrashTasks.map(task => <TrashTaskCard key={task.task_id} data={task} setTrashToRestore={setTrashToRestore} />)
                }
              </div>
            </ScrollArea>
          }
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!trashToRestore}
        onOpenChange={open => {
          if (!open) {
            setTrashToRestore(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" ><Undo2 /> Restore task?</DialogTitle>
            <DialogDescription>Are you sure you want to restore this task?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"outline"} onClick={() => setTrashToRestore(null)}
              disabled={restoreTaskFromTrashIsPending}
            >Cancel</Button>
            <Button
              onClick={handleRestoreTask}
              disabled={restoreTaskFromTrashIsPending}
            >
              {
                restoreTaskFromTrashIsPending ? <Spinner /> : "I'm sure"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

}

export default TaskboardTrashSheet;

type TTrashTaskCardProps = {
  data: TTaskPrimitive,
  setTrashToRestore: (value: TTaskPrimitive | null) => void
}

const TrashTaskCard: React.FC<TTrashTaskCardProps> = ({
  data,
  setTrashToRestore
}) => {

  return (
    <div
      className={cn(
        `flex flex-col`,
        `bg-card rounded-md border transition-all duration-500`,
        `hover:border-primary hover:shadow-lg`,
      )}
    >
      <div
        className={cn(
          `flex items-start justify-between`
        )}
      >
        <p
          className={cn(
            `w-fit text-xs font-semibold px-2 py-1 rounded-md `,
            `bg-primary text-primary-foreground`,
            ` mx-2 mt-2 `,
            getHexLuminance(data.project_color) > 0.4 ? `text-black` : `text-white`
          )}
          style={{
            backgroundColor: data.project_color === "#ffffff" ? undefined : data.project_color
          }}
        >{data.project_abbreviation.toUpperCase()}-{data.task_depth}</p>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={"ghost"}
                size={"icon"}
                className=" mx-2 mt-2 "
                onClick={() => setTrashToRestore(data)}
              >
                <ArchiveRestore className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Restore</TooltipContent>
        </Tooltip>
      </div>
      <p
        className={cn(
          `font-medium p-3 `
        )}
      >{data.task_title}</p>
    </div>
  )

}