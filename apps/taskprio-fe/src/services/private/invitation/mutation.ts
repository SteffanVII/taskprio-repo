import { axiosInstance } from "@/services/axios"
import { useMutation } from "@tanstack/react-query"
// import { useSearchParams } from "react-router"

export const useAcceptInvitation = ( successCallback? : () => void ) => {

    // const [ searchParams, setSearchParams ] = useSearchParams()

    return useMutation({
        mutationFn : async ( invite_token : string ) => {
            const response = await axiosInstance.post(
                `/private/invitation/workspace/accept/${invite_token}`
            )
            return response.data
        },
        onSuccess : () => {
            // searchParams.delete("invite_token")
            // setSearchParams( searchParams )
            successCallback?.()
        }
    })

}