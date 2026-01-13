import { useWorkspaceStore_workspaceRole } from "@/stores/workspace"
import { EWorkspaceRole } from "@repo/taskprio-types/src"

const useUserWorkspaceOwner = () => {
    const workspaceRole = useWorkspaceStore_workspaceRole()
    return workspaceRole === EWorkspaceRole.OWNER
}

export default useUserWorkspaceOwner;