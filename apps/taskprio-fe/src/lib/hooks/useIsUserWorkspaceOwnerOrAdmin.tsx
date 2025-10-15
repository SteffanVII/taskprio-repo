import { useGlobalsStore } from "@/stores/globals"
import { EWorkspaceRole } from "@repo/taskprio-types/src"


const useIsUserWorkspaceOwnerOrAdmin = () => {

    const {
        workspaceRole
    } = useGlobalsStore()

    return workspaceRole === EWorkspaceRole.OWNER || workspaceRole === EWorkspaceRole.ADMIN

}

export default useIsUserWorkspaceOwnerOrAdmin