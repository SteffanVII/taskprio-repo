import { useMutation, useQuery } from "@tanstack/react-query"
import { TLoginPayload, TLoginResponse, TRegisterPayload, TRegisterResponse } from "./types"
import { axiosInstance } from "../axios"
import { AxiosResponse } from "axios"
import { updateGlobalsStore } from "@/stores/globals"

export const useLogin = ( successCallback : ( data : TLoginResponse ) => void ) => {

    return useMutation<TLoginResponse, any, TLoginPayload>({
        mutationFn: async ( payload ) => {

            const response : AxiosResponse<TLoginResponse> = await axiosInstance.post(
                `/login`,
                payload.body,
            )

            if ( response.status === 200 && successCallback ) {
                successCallback( response.data )
            }

            return response.data
            
        },
        onSuccess : () => {
            updateGlobalsStore({
                authenticated : true
            })
        }
    })

}

export const useGoogleLoginT = ( successCallback : ( data : TLoginResponse ) => void ) => {
    return useMutation<TLoginResponse, any, { clientId : string, credential : string }>({
        mutationFn : async ( payload : { clientId : string, credential : string } ) => {
            const response = await axiosInstance.post<TLoginResponse>(
                `/login/google`,
                {
                    client_id : payload.clientId,
                    credential : payload.credential
                }
            )
            return response.data
        },
        onSuccess : ( data ) => {
            successCallback( data )
            updateGlobalsStore({
                authenticated : true
            })
        }
    })
}

export const useRegister = ( successCallback : ( data : TRegisterResponse ) => void ) => {

    return useMutation<TRegisterResponse, any, TRegisterPayload>({
        mutationFn: async ( payload ) => {

            const response : AxiosResponse<TRegisterResponse> = await axiosInstance.post(
                `/register`,
                payload.body
            )

            if ( response.status === 201 && successCallback ) {
                successCallback( response.data )
            }

            return response.data
        },
        onSuccess : () => {
            updateGlobalsStore({
                authenticated : true
            })
        }
    })
    
}

export const useAuthenticate = (
    successCallback? : () => void,
    errorCallback? : () => void
) => {

    return useMutation({
        mutationFn : async () => {
            const response = await axiosInstance.post(
                `/auth`
            )
            return response.data
        },
        onSuccess : () => {
            if ( successCallback ) {
                successCallback()
            }
        },
        onError : () => {
            if ( errorCallback ) {
                errorCallback()
            }
        }
    })

}