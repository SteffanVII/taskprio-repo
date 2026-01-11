import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils"
import { useGlobalsStore_selectedProject, useGlobalsStore_selectedTaskboard, useGlobalsStore_user } from "@/stores/globals";
import { Check, Plus } from "lucide-react"
import React from "react";
import UserAvatar from "../UserAvatar";
import { useAddTaskAssignee, useRemoveTaskAssignee } from "@/services/private/task/mutation";
import { TProjectMember } from "@repo/taskprio-types/src";
import { Button } from "@/components/ui/button";

export type TTaskAssignerProps = {
    task_id? : string,
    assignees : string[],
    disabledHoverCard? : boolean,
    onAssigneesChange : ( assignees : string[] ) => void
}

const TaskAssigner : React.FC<TTaskAssignerProps> = ( {
    task_id,
    assignees,
    disabledHoverCard,
    onAssigneesChange
} ) => {

    const user = useGlobalsStore_user()
    const selectedProject = useGlobalsStore_selectedProject()
    const selectedTaskboard = useGlobalsStore_selectedTaskboard()

    const {
        mutateAsync : addTaskAssignee
    } = useAddTaskAssignee()

    const {
        mutateAsync : removeTaskAssignee
    } = useRemoveTaskAssignee()

    const handleAssigning = ( projectMember : TProjectMember ) => {
        console.log(task_id);
        if ( assignees.includes( projectMember.user_id ) ) {
            onAssigneesChange( assignees.filter( ( id ) => id !== projectMember.user_id ) )
            if ( task_id ) {
                removeTaskAssignee( {
                    body : {
                        task_id,
                        taskboard_id : selectedTaskboard!.task_board_id,
                        user_id : projectMember.user_id
                    }
                } )
            }
        } else {
            onAssigneesChange( [ ...assignees, projectMember.user_id ] )
            if ( task_id ) {
                addTaskAssignee( {
                    optimisticData : {
                        user_id : projectMember.user_id,
                        firstname : projectMember.firstname,
                        lastname : projectMember.lastname
                    },
                    body : {
                        task_id,
                        taskboard_id : selectedTaskboard!.task_board_id,
                        user_id : projectMember.user_id
                    }
                } )
            }
        }
    }

    return (
        <Popover>
            <PopoverTrigger
                onClick={ e => {
                    e.stopPropagation()
                } }
                render={
                    <div
                        className={cn(
                            ` flex flex-wrap justify-end items-center gap-2 cursor-pointer hover:text-primary hover:underline `
                        )}
                    >
                        <Plus className={` size-[1rem] text-primary cursor-pointer `} />
                        {
                            assignees.length < 1 && <span className="text-primary" >Assign</span>
                        }
                        {
                            assignees.map( ( assignee ) => (
                                <UserAvatar
                                    key={assignee}
                                    user_id_or_email={assignee}
                                    size="sm"
                                    disableHoverCard={disabledHoverCard}
                                />
                            ) )
                        }
                    </div>
                }
            />
            <PopoverContent
                className={cn(
                    ` p-0 `
                )}
                onClick={ e => {
                    e.preventDefault()
                    e.stopPropagation()
                } }
            >
                <div
                    className={cn(
                        ` max-h-[20rem] p-2 space-y-2 overflow-y-auto `,
                        ` flex flex-col rounded-sm `
                    )}
                >
                    {
                        selectedProject?.project_members.filter( ( member ) => member.is_active ).map( ( member ) => (
                            <Button
                                key={member.user_id}
                                role="button"
                                className={cn(
                                    `flex justify-start cursor-pointer`
                                    // ` p-2 `,
                                    // ` flex gap-4 items-center cursor-pointer `,
                                    // ` hover:bg-blue-200 `,
                                    // assignees.includes( member.user_id ) && ` bg-blue-400 `
                                )}
                                variant={assignees.includes( member.user_id ) ? "default" : "outline"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleAssigning( member )
                                }}
                            >
                                <UserAvatar user_id_or_email={member.user_id} size="sm" disableHoverCard />
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
                            </Button>
                        ) )
                    }
                </div>
            </PopoverContent>
        </Popover>
    )

}

export default TaskAssigner;