import { TWorkspaceMember } from "@/services/private/workspace/types"
import { useGlobalsStore } from "@/stores/globals"
import { useCallback, useMemo } from "react"


const useGetWorkspaceMemberDetails = () => {

    const {
        selectedWorkspace
    } = useGlobalsStore()

    const getWorkspaceMemberDetails = useCallback(( user_id : string ) : TWorkspaceMember | null => {
        if ( !selectedWorkspace ) return null

        const workspaceMember = selectedWorkspace.workspace_members.find( member => member.user_id === user_id )

        return workspaceMember ?? null

    }, [ selectedWorkspace ])

    return getWorkspaceMemberDetails

}

export default useGetWorkspaceMemberDetails;