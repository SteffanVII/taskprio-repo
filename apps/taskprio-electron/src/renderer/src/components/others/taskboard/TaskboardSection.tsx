import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TTaskSectionWithTasks } from "@repo/taskprio-types";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import TaskboardTaskInitialCreator from "./TaskboardTaskInitialCreator";
import { useCreateTask } from "@/services/private/task/mutation";
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard";

import TaskboardTask from "./TaskboardTask";
import TaskboardTaskDrop from "./TaskboardTaskDrop";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import TaskboardSectionMenu from "./TaskboardSectionMenu";
import { Input } from "@/components/ui/input";
import { useUpdateTaskboardSection } from "@/services/private/tasksection/mutation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NumberFlow from "@number-flow/react";
import { useDraggable } from "@dnd-kit/core";
import { ETaskboardDragDataType } from "./Taskboard";

export type TTaskboardSectionProps = {
  taskSection: TTaskSectionWithTasks,
  preview?: boolean
}

export const TaskboardSection: React.FC<TTaskboardSectionProps> = ({
  taskSection,
  preview
}) => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()

  const [createTask, setCreateTask] = useState(false)

  const [rename, setRename] = useState(false)
  const [renameValue, setRenameValue] = useState("")

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useDraggable({
    id: taskSection.task_section_id + (preview ? "_preview" : ""),
    data: {
      type: ETaskboardDragDataType.SECTION,
      data: taskSection
    },
    disabled: preview
  })

  // const [ taskVisibility, setTaskVisibility ] = useState<Record<string, boolean>>({})

  // const taskRefs = useRef<Record<string, HTMLDivElement>>({});
  // const intersectionObserverRef = useRef<IntersectionObserver>(null)

  const {
    mutateAsync: createTaskMutation,
    isPending: isCreatingTask
  } = useCreateTask()

  const {
    mutateAsync: updateTaskboardSectionMutation
  } = useUpdateTaskboardSection()

  const sortedTaskSectionTasks = useMemo(() => {
    return [...taskSection.tasks].sort((a, b) => {
      // taskVisibility[a.task_id] = taskVisibility[a.task_id] ?? false;
      return b.display_order - a.display_order
    })
  }, [taskSection.tasks])

  const onTaskSubmit = (taskTitle: string) => {
    if (taskTitle.trim() === "") return
    if (!selectedTaskboard) return
    createTaskMutation({
      task_board_id: selectedTaskboard.task_board_id,
      task_section_id: taskSection.task_section_id,
      task_title: taskTitle
    })
  }

  // IMPORTANT : Prevent the taskboard from being drag scrolled
  const onMouseDownHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const openRenameModal = () => {
    setRenameValue(taskSection.task_section_name)
    setRename(true)
  }

  const closeRenameModal = () => {
    setRename(false)
    setRenameValue("")
  }

  const onRenameSubmit = () => {

    if (renameValue.trim() === "") {
      return
    }

    updateTaskboardSectionMutation({
      task_section_id: taskSection.task_section_id,
      body: {
        task_section_name: renameValue
      }
    })

    closeRenameModal()
  }

  // useEffect(() => { 
  //     intersectionObserverRef.current = new IntersectionObserver(( entries ) => {
  //         const updates : Record<string, boolean> = {};
  //         entries.forEach( entry => {
  //             const taskId = (entry.target as HTMLElement).dataset.taskId;
  //             if (taskId) {
  //                 updates[taskId] = entry.isIntersecting;
  //             }
  //         } )
  //         setTaskVisibility( prev => ({...prev, ...updates}) )
  //     }, {
  //         root : null,
  //         rootMargin : "400px",
  //         threshold: 0.1,
  //     })
  //     return () => {
  //         intersectionObserverRef.current?.disconnect()
  //     }
  // }, [])

  // useEffect(() => {
  //     const currentObserver = intersectionObserverRef.current;
  //     if (!currentObserver) return;

  //     // Disconnect previous observer
  //     currentObserver.disconnect();

  //     // Observe all task elements
  //     Object.keys(taskRefs.current).forEach(taskId => {
  //         const element = document.querySelector(`[data-task-id="${taskId}"]`);
  //         if (element) {
  //             currentObserver.observe(element);
  //         }
  //     });

  //     return () => {
  //         currentObserver.disconnect();
  //     };
  // }, [taskSection.tasks])

  return (
    <div
      className={cn(
        ` w-[20rem] min-w-[20rem] h-full min-h-0 `,
        ` grid transition-opacity `,
        isDragging && `opacity-50`
      )}
      style={{
        gridTemplateRows: "min-content 1fr"
      }}
    >
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          ` w-full p-1 pl-2 `,
          `flex justify-between items-center gap-2 `,
          `border-l-8 rounded shadow-md`,
          `bg-background z-10 `,
          rename && `pl-1`
        )}
        style={taskSection.task_section_color ? {
          // color: getHexLuminance(taskSection.task_section_color) > 0.4 ? "black" : "white",
          borderColor: taskSection.task_section_color,
          backgroundColor: `${taskSection.task_section_color}1a`,
          // boxShadow: `${taskSection.task_section_color}40 0px 0.5rem 10px 0px`
        } : undefined}
        onMouseDown={onMouseDownHandler}
      >
        {
          rename ?
            <Input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => {
                closeRenameModal()
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onRenameSubmit()
                }
                if (e.key === 'Escape') {
                  e.currentTarget.blur()
                }
              }}
              className=" !border-background !bg-input !h-[2rem] "
              autoFocus
            />
            :
            <div className=" flex items-center gap-2 " >
              <Badge variant={"secondary"} >
                <NumberFlow
                  value={taskSection.tasks.length > 99 ? 99 : taskSection.tasks.length}
                />
              </Badge>
              <p className="text-sm " >{taskSection.task_section_name}</p>
            </div>
        }
        <div
          className=" flex "
        >
          <TaskboardSectionMenu
            taskSection={taskSection}
            openRenameModal={openRenameModal}
          />
          <Button
            variant="ghost"
            size="icon"
            className=" size-8 "
            onClick={() => {
              setCreateTask(true)
            }}
          ><Plus className=" size-4 " /></Button>
        </div>
      </div>

      <ScrollArea
        id="taskboard-section-scroll-area"
        className="relative flex flex-col w-full h-full min-h-full "
      >
        <div
          className={cn(
            `relative grow w-full h-full min-h-full `,
            `flex flex-col`,
            // `border border-green-400`
          )}
        >
          {
            (createTask || isCreatingTask) &&
            <TaskboardTaskInitialCreator
              outOfFocusCallback={(taskTitle) => {
                setCreateTask(false)
                onTaskSubmit(taskTitle)
              }}
            />
          }
          {
            sortedTaskSectionTasks.length === 0 &&
            <TaskboardTaskDrop
              task_section_id={taskSection.task_section_id}
              display_order={100}
              fullSize={true}
            />
          }
          {
            sortedTaskSectionTasks.sort((a, b) => b.display_order - a.display_order).map((task, taskIndex) => {

              // const singleTask = sortedTaskSectionTasks.length === 1
              const firstTask = taskIndex === 0
              const lastTask = taskIndex === sortedTaskSectionTasks.length - 1

              const adjacentBottom = lastTask ? null : sortedTaskSectionTasks[taskIndex + 1]

              const displayOrderTop = task.display_order + 100
              const displayOrderBottom = lastTask ? task.display_order - 100 : ((task.display_order - adjacentBottom!.display_order) / 2) + adjacentBottom!.display_order

              return (
                <React.Fragment key={task.task_id}>
                  {
                    firstTask &&
                    <TaskboardTaskDrop
                      task_section_id={taskSection.task_section_id}
                      display_order={displayOrderTop}
                      bottomTaskId={task?.task_id}
                    />
                  }
                  <TaskboardTask
                    key={task.task_id}
                    task={task}
                  />
                  <TaskboardTaskDrop
                    task_section_id={taskSection.task_section_id}
                    display_order={displayOrderBottom}
                    topTaskId={task.task_id}
                    bottomTaskId={adjacentBottom?.task_id}
                    fullSize={lastTask}
                  />
                </React.Fragment>
              )
            })
          }
        </div>
      </ScrollArea>
    </div>
  )

}

export default React.memo(TaskboardSection);