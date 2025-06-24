import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { useGlobalsStore } from "@/stores/globals"
import React, { useMemo } from "react"
import WorkspaceMemberBadge from "./WorkspaceMemberBadge"

export type TUserAvatarProps = {
    user_id : string
}

const UserAvatar : React.FC<TUserAvatarProps> = ({
    user_id
}) => {

    const {
        selectedWorkspace
    } = useGlobalsStore()

    const user = useMemo(() => {
        return selectedWorkspace?.workspace_members.find( member => member.user_id === user_id )
    }, [ user_id, selectedWorkspace ])

    return (
        <HoverCard>
            <HoverCardTrigger asChild >
                <span
                    onClick={ e => {
                        e.stopPropagation()
                    } }
                    className={cn(
                        ` size-[1.6rem] rounded-full bg-gray-400 `
                    )}
                >
                </span>
            </HoverCardTrigger>
            <HoverCardContent
                className={` !max-w-screen !w-fit `}
            >
                <div
                    className={cn(
                        ` flex gap-4 `
                    )}
                >
                    <span
                        className={cn(
                            ` shrink-0 size-[2.6rem] rounded-full bg-gray-400 `
                        )}
                    >
                    </span>
                    <div
                        className={cn(
                            ` flex flex-col gap-1 `
                        )}
                    >
                        <p className=" font-medium " >{user?.firstname} {user?.lastname}</p>
                        <p className=" text-sm " >{user?.email}</p>
                        {
                            user?.workspace_role &&
                            <WorkspaceMemberBadge
                                role={user.workspace_role}
                            />
                        }
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )

}

export default UserAvatar;