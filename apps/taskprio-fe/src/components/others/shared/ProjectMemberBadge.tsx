import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EProjectRole } from "@repo/taskprio-types/src"
import React from "react"

export type TProjectMemberBadgeProps = {
    role : EProjectRole
}

const ProjectMemberBadge : React.FC<TProjectMemberBadgeProps> = ({
    role
}) => {

    if ( role === EProjectRole.OWNER ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-green-500 text-white `
                )}
            >
                Project Owner
            </Badge>
        )
    }

    if ( role === EProjectRole.MEMBER ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-blue-500 text-white `
                )}
            >
                Project Member
            </Badge>
        )
    }

    if ( role === EProjectRole.GUEST ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-gray-500 text-white `
                )}
            >
                Project Guest
            </Badge>
        )
    }

    if ( role === EProjectRole.ADMIN ) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    ` border-none `,
                    ` bg-purple-700 text-white `
                )}
            >
                Project Admin
            </Badge>
        )
    }
    
}

export default ProjectMemberBadge;