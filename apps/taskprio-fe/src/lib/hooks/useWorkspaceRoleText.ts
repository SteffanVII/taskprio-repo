import { EWorkspaceRole } from "@repo/taskprio-types/src"

const useWorkspaceRoleText = () => {

    return ( role : EWorkspaceRole ) => {

        switch ( role ) {
            case EWorkspaceRole.OWNER:
                return "Workspace Owner"
            case EWorkspaceRole.MEMBER:
                return "Workspace Member"
            case EWorkspaceRole.GUEST:
                return "Workspace Guest"
        }
    }

}

export default useWorkspaceRoleText;