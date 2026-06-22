import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDialogsStore } from "@/stores/dialogs";
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard";
import { Link } from "@tanstack/react-router";
import { Archive, EllipsisVertical, Pencil, StopCircle, Trash2, X } from "lucide-react";


const TaskboardHeader = () => {

  const taskboard = useTaskboardStore_selectedTaskboard()
  
  const setRenameTaskboardDialog = useDialogsStore(state => state.setRenameTaskboardDialog)
  const setTaskboardTaskTrashSheet = useDialogsStore(state => state.setTaskboardTaskTrashSheet)
  const setDropTaskboardDialog = useDialogsStore(state => state.setDropTaskboardDialog)
  const setDeactivateTaskboardDialog = useDialogsStore(state => state.setDeactivateTaskboardDialog)

  const handleOpenRenameTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setRenameTaskboardDialog( taskboard, true )
  }

  const handleOpenTrashTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setTaskboardTaskTrashSheet(true)
  }

  const handleOpenDropTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDropTaskboardDialog( taskboard, true )
  }

  const handleOpenDeactivateTaskboardDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDeactivateTaskboardDialog( taskboard, true )
  }

  return (
    <nav
      className={cn(
        "h-fit p-4 pb-0",
        "flex items-center gap-4",
        "bg-muted"
      )}
    >
      <Button
        size={"icon"}
        variant={"outline"}
        render={
          <Link
            from="/workspace/$workspace_id/project/$project_id/taskboard/$taskboard_id"
            to="/workspace/$workspace_id/project/$project_id"
          >
            <X/>
          </Link>
        }
      ></Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size={"icon"}
              variant={"ghost"}
            >
              <EllipsisVertical/>
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleOpenRenameTaskboardDialog}
          >
            Rename
            <DropdownMenuShortcut><Pencil /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenTrashTaskboardDialog}
          >
            Task Archive
            <DropdownMenuShortcut><Archive /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-destructive" >Danger Zone</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onClick={handleOpenDeactivateTaskboardDialog} >
              Deactivate
              <DropdownMenuShortcut><StopCircle className="text-destructive" /></DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleOpenDropTaskboardDialog} >
              Drop
              <DropdownMenuShortcut><Trash2 className="text-destructive" /></DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <h3
        className={cn(
          "text-xl font-bold"
        )}
      >{taskboard?.task_board_name}</h3>
    </nav>
  )
}

export default TaskboardHeader;