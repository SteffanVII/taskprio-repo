import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils"
import { useGlobalsStore } from "@/stores/globals";
import { Check, Plus } from "lucide-react"
import React from "react";
import UserAvatar from "../UserAvatar";
import { useAddTaskAssignee, useRemoveTaskAssignee } from "@/services/private/task/mutation";
import { TProjectMember } from "@repo/taskprio-types/src";

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
        user,
        selectedProject
    } = useGlobalsStore()

    const {
        mutateAsync : addTaskAssignee
    } = useAddTaskAssignee()

    const {
        mutateAsync : removeTaskAssignee
    } = useRemoveTaskAssignee()

    const handleAssigning = ( projectMember : TProjectMember ) => {
        if ( assignees.includes( projectMember.user_id ) ) {
            onAssigneesChange( assignees.filter( ( id ) => id !== projectMember.user_id ) )
            if ( task_id ) {
                removeTaskAssignee( {
                    task_id,
                    body : {
                        user_id : projectMember.user_id
                    }
                } )
            }
        } else {
            onAssigneesChange( [ ...assignees, projectMember.user_id ] )
            if ( task_id ) {
                addTaskAssignee( {
                    task_id,
                    optimisticData : {
                        user_id : projectMember.user_id,
                        firstname : projectMember.firstname,
                        lastname : projectMember.lastname
                    },
                    body : {
                        user_id : projectMember.user_id
                    }
                } )
            }
        }
    }

    return (
        <Popover
            modal={false}
        >
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
                            ` hover:text-blue-800 hover:underline `
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
                                    key={assignee}
                                    user_id_or_email={assignee}
                                    size="sm"
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
                                key={member.user_id}
                                role="button"
                                className={cn(
                                    ` p-2 `,
                                    ` flex gap-4 items-center cursor-pointer `,
                                    ` hover:bg-blue-200 `,
                                    assignees.includes( member.user_id ) && ` bg-blue-400 `
                                )}
                                onClick={() => {
                                    handleAssigning( member )
                                }}
                            >
                                {/* Create profile picture component later */}
                                <UserAvatar user_id_or_email={member.user_id} size="sm" />
                                {
                                    member.user_id === user?.user_id ?
                                    <>
                                        <p>You</p> <p>{`(${ member.firstname } ${member.lastname})`}</p>
                                    </>
                                    :
                                    <p>{member.firstname} {member.lastname}</p>
                                }
                                {
                                    assignees.includes( member.user_id ) &&
                                    <Check className=" text-background size-4 ml-auto mr-2 " />
                                }
                            </div>
                        ) )
                    }
                </div>
            </PopoverContent>
        </Popover>
    )

}

export default TaskAssigner;