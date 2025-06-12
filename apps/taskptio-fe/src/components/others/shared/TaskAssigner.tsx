import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils"
import { useGlobalsStore } from "@/stores/globals";
import { Plus } from "lucide-react"
import React from "react";
import UserAvatar from "./UserAvatar";
import { useAddTaskAssignee, useRemoveTaskAssignee } from "@/services/private/task/mutation";

export type TTaskAssignerProps = {
    task_id? : string,
    assignees : string[]
    onAssigneesChange : ( assignees : string[] ) => void
}

const TaskAssigner : React.FC<TTaskAssignerProps> = ( {
    task_id,
    assignees,
    onAssigneesChange
} ) => {

    const {
        selectedProject
    } = useGlobalsStore()

    const {
        mutateAsync : addTaskAssignee
    } = useAddTaskAssignee()

    const {
        mutateAsync : removeTaskAssignee
    } = useRemoveTaskAssignee()

    const handleAssigning = ( user_id : string) => {
        if ( assignees.includes( user_id ) ) {
            onAssigneesChange( assignees.filter( ( id ) => id !== user_id ) )
            if ( task_id ) {
                removeTaskAssignee( {
                    task_id,
                    body : {
                        user_id
                    }
                } )
            }
        } else {
            onAssigneesChange( [ ...assignees, user_id ] )
            if ( task_id ) {
                addTaskAssignee( {
                    task_id,
                    body : {
                        user_id
                    }
                } )
            }
        }
    }

    return (
        <Popover modal >
            <PopoverTrigger
                asChild
                onClick={ e => {
                    e.stopPropagation()
                } }
            >
                {
                    assignees.length < 1 ?
                    <button
                        className={cn(
                            ` h-[1.6rem] `,
                            ` flex items-center gap-2 text-sm text-blue-400 cursor-pointer `,
                            ` hover:text-blue-800 `
                        )}
                        onClick={ e => {
                            e.stopPropagation()
                        } }
                    ><Plus className=" size-4 " /> Assign</button>
                    :
                    <div
                        className={cn(
                            ` flex flex-wrap justify-end gap-2 `
                        )}
                    >
                        <button>
                            <Plus className={` size-[1rem] text-blue-400 cursor-pointer `} />
                        </button>
                        {
                            assignees.map( ( assignee ) => (
                                <UserAvatar
                                    user_id={assignee}
                                />
                            ) )
                        }
                    </div>
                }
            </PopoverTrigger>
            <PopoverContent
                noPortal
                className={cn(
                    ` p-0 `
                )}
                onClick={ e => {
                    e.stopPropagation()
                } }
            >
                <div
                    className={cn(
                        ` max-h-[20rem] overflow-y-auto `,
                        ` flex flex-col rounded-sm `
                    )}
                >
                    {
                        selectedProject?.project_members.map( ( member ) => (
                            <div
                                role="button"
                                className={cn(
                                    ` p-2 `,
                                    ` flex gap-4 items-center cursor-pointer `,
                                    ` hover:bg-blue-200 `,
                                    assignees.includes( member.user_id ) && ` bg-blue-400 `
                                )}
                                onClick={() => {
                                    handleAssigning( member.user_id )
                                }}
                            >
                                {/* Create profile picture component later */}
                                <span
                                    className={cn(
                                        ` size-[1.6rem] rounded-full bg-gray-400 `
                                    )}
                                ></span>
                                <p>{member.firstname} {member.lastname}</p>
                            </div>
                        ) )
                    }
                </div>
            </PopoverContent>
        </Popover>
    )

}

export default TaskAssigner;