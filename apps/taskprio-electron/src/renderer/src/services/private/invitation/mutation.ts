import { axiosInstance } from "@/services/axios"
import { QueryKeys } from "@/services/enum"
import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { useSearchParams } from "@tanstack/react-router"

export const useAcceptInvitation = (successCallback?: () => void) => {

  // const [ searchParams, setSearchParams ] = useSearchParams()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invite_token: string) => {
      const response = await axiosInstance.post(
        `/private/invitation/workspace/accept/${invite_token}`
      )
      return response.data
    },
    onSuccess: () => {
      // searchParams.delete("invite_token")
      // setSearchParams( searchParams )
      queryClient.invalidateQueries({
        queryKey: [...QueryKeys.GET_USER_WORKSPACES.split]
      })
      successCallback?.()
    }
  })

}