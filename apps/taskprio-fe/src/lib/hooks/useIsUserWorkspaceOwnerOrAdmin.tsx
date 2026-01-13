import { useWorkspaceStore_workspaceRole } from "@/stores/workspace"
import { EWorkspaceRole } from "@repo/taskprio-types/src"

const useIsUserWorkspaceOwnerOrAdmin = () => {
    const workspaceRole = useWorkspaceStore_workspaceRole()
    return workspaceRole === EWorkspaceRole.OWNER || workspaceRole === EWorkspaceRole.ADMIN
}

export default useIsUserWorkspaceOwnerOrAdmin