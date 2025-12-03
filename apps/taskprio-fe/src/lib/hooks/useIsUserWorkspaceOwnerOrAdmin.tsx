import { useGlobalsStore_workspaceRole } from "@/stores/globals"
import { EWorkspaceRole } from "@repo/taskprio-types/src"

const useIsUserWorkspaceOwnerOrAdmin = () => {
    const workspaceRole = useGlobalsStore_workspaceRole()
    return workspaceRole === EWorkspaceRole.OWNER || workspaceRole === EWorkspaceRole.ADMIN
}

export default useIsUserWorkspaceOwnerOrAdmin