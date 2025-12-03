import { cn } from "@/lib/utils";
import { TTaskForCardView } from "@repo/taskprio-types/src";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import UserAvatar from "../shared/UserAvatar";
import { updateDialogsStore } from "@/stores/dialogs";

type TTaskboardTaskAssignerTrigger_TaskboardTaskProps = {
    task : TTaskForCardView
}

const TaskboardTaskAssignerTrigger_TaskboardTask : React.FC<TTaskboardTaskAssignerTrigger_TaskboardTaskProps> = ({
    task
}) => {

    const [ assignees ] = useState<string[]>(task.assignees.map( assignee => assignee.user_id ))

    const handleTriggerOnClick = () => {
        updateDialogsStore({
            taskAssignerDialog : {
                open : true,
                task
            }
        })
    }
    
    return (
        <div
            className={cn(
                ``
            )}
        >
            {
                assignees.length < 1 ?
                <button
                    className={cn(
                        ` h-[1.6rem] `,
                        ` flex items-center gap-2 text-sm text-primary cursor-pointer `,
                        ` hover:text-primary hover:underline `
                    )}
                    onClick={ e => {
                        e.stopPropagation()
                        handleTriggerOnClick()
                    } }
                ><Plus className=" size-4 " /> Assign</button>
                :
                <div
                    className={cn(
                        ` flex flex-wrap justify-end gap-2 `
                    )}
                >
                    <button>
                        <Plus
                            className={` size-[1rem] text-primary cursor-pointer `}
                            onClick={ e => {
                                e.stopPropagation()
                                handleTriggerOnClick()
                            } }
                        />
                    </button>
                    {
                        assignees.map( ( assignee ) => (
                            <UserAvatar
                                key={assignee}
                                user_id_or_email={assignee}
                                size="sm"
                                disableHoverCard
                            />
                        ) )
                    }
                </div>
            }
        </div>
    )

}


export default TaskboardTaskAssignerTrigger_TaskboardTask;