import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EWorkspaceRole } from "@repo/taskprio-types/src"
import React from "react"

export type TWorkspaceMemberBadgeProps = {
    role : EWorkspaceRole
}

const WorkspaceMemberBadge : React.FC<TWorkspaceMemberBadgeProps> = ({
    role
}) => {

    if ( role === EWorkspaceRole.OWNER ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-green-500 text-white `
                )}
            >
                Workspace Owner
            </Badge>
        )
    }

    if ( role === EWorkspaceRole.MEMBER ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-blue-500 text-white `
                )}
            >
                Workspace Member
            </Badge>
        )
    }

    if ( role === EWorkspaceRole.GUEST ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-gray-500 text-white `
                )}
            >
                Workspace Guest
            </Badge>
        )
    }

    if ( role === EWorkspaceRole.ADMIN ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-purple-700 text-white `
                )}
            >
                Workspace Admin
            </Badge>
        )
    }
    
}

export default WorkspaceMemberBadge;