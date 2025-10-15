import { useQuery } from "@tanstack/react-query"
import { TGetUserProfileResponse } from "./types"
import { QueryKeys } from "@/services/enum"
import { axiosInstance } from "@/services/axios"


export const useGetUserProfile = () => {

    return useQuery<TGetUserProfileResponse, Error>({
        queryKey : [ ...QueryKeys.GET_USER_PROFILE.split ],
        queryFn : async () => {
            const response = await axiosInstance.get<TGetUserProfileResponse>(
                `/private/profile`
            )
            return response.data
        }
    })

}