import { useGlobalsStore_user } from "@/stores/globals";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { EWorkspaceRole } from "@repo/taskprio-types";
import { useMemo } from "react";


const useGetMyWorkspaceRole = () => {

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
    const user = useGlobalsStore_user()


    const myRole = useMemo<EWorkspaceRole | null>(() => {
        if (!selectedWorkspace || !user) return null
        return selectedWorkspace.workspace_members.find(member => member.user_id === user.user_id)?.workspace_role ?? null
    }, [selectedWorkspace, user])

    return myRole

}

export default useGetMyWorkspaceRole;