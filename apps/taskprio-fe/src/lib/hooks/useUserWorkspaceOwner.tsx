import { useGlobalsStore_workspaceRole } from "@/stores/globals"
import { EWorkspaceRole } from "@repo/taskprio-types/src"

const useUserWorkspaceOwner = () => {
    const workspaceRole = useGlobalsStore_workspaceRole()
    return workspaceRole === EWorkspaceRole.OWNER
}

export default useUserWorkspaceOwner;