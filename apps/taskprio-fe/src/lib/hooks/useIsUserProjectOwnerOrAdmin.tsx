import { useGlobalsStore_projectRole } from "@/stores/globals"
import { EProjectRole } from "@repo/taskprio-types/src"


const useIsUserProjectOwnerOrAdmin = () => {

    const projectRole = useGlobalsStore_projectRole()


    return projectRole === EProjectRole.OWNER || projectRole === EProjectRole.ADMIN

}

export default useIsUserProjectOwnerOrAdmin;