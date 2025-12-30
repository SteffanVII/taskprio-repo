import { axiosInstance } from "@/services/axios"
import { TGetInvitationInfoResponseData } from "@repo/taskprio-types/src"
import { useQuery } from "@tanstack/react-query"

export const useGetInvitationInfo = (invite_token?: string | null) => {

    return useQuery<TGetInvitationInfoResponseData>({
        queryKey: ["invitation", "info", invite_token],
        queryFn: async () => {
            const response = await axiosInstance.get(
                `/invitation/workspace/info/${invite_token}`
            )
            return response.data
        },
        enabled: !!invite_token
    })

}