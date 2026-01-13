import { TWorkspaceMember } from "@repo/taskprio-types/src/index"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import { useCallback } from "react"


const useGetWorkspaceMemberDetails = () => {

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const getWorkspaceMemberDetails = useCallback((user_id: string): TWorkspaceMember | null => {
        if (!selectedWorkspace) return null

        const workspaceMember = selectedWorkspace.workspace_members.find(member => member.user_id === user_id)

        return workspaceMember ?? null

    }, [selectedWorkspace])

    return getWorkspaceMemberDetails

}

export default useGetWorkspaceMemberDetails;