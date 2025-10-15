import { useGlobalsStore } from "@/stores/globals"
import { EProjectRole } from "@repo/taskprio-types/src"


const useIsUserProjectOwnerOrAdmin = () => {

    const {
        projectRole
    } = useGlobalsStore()

    return projectRole === EProjectRole.OWNER || projectRole === EProjectRole.ADMIN

}

export default useIsUserProjectOwnerOrAdmin;