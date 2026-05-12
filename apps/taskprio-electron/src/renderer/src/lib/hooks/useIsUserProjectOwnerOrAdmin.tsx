import { useProjectStore_projectRole } from "@/stores/project"
import { EProjectRole } from "@repo/taskprio-types"


const useIsUserProjectOwnerOrAdmin = () => {

    const projectRole = useProjectStore_projectRole()


    return projectRole === EProjectRole.OWNER || projectRole === EProjectRole.ADMIN

}

export default useIsUserProjectOwnerOrAdmin;