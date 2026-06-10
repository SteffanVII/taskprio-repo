import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { TAuthenticateResponse, TLoginPayload, TLoginResponse, TRegisterPayload, TRegisterResponse } from "./types"
import { axiosInstance } from "../axios"
import { AxiosResponse } from "axios"
import { updateGlobalsStore } from "@/stores/globals"

/**
 * @description Login mutation. On success, it updates the globals store to set the authenticated state to true.
 * @param successCallback - Callback function to handle successful login
 * @returns A mutation object with the login mutation function
 */
export const useLogin = (successCallback: (data: TLoginResponse) => void) => {

  return useMutation<TLoginResponse, any, TLoginPayload>({
    mutationFn: async (payload) => {

      const response: AxiosResponse<TLoginResponse> = await axiosInstance.post(
        `/login`,
        payload.body,
      )

      if (response.status === 200 && successCallback) {
        successCallback(response.data)
      }

      return response.data

    },
    onSuccess: (data, variables) => {
      if (!variables.body.for_invitation_purpose) {
        updateGlobalsStore({
          authenticated: true,
          user: data.user
        })
      } else {
        updateGlobalsStore({
          invitationRecipient: data.user
        })
      }
    }
  })

}

/**
 * @description Google login mutation. On success, it updates the globals store to set the authenticated state to true.
 * @param successCallback - Callback function to handle successful login
 * @returns A mutation object with the google login mutation function
 */
export const useGoogleLoginT = (successCallback: (data: TLoginResponse) => void) => {
  return useMutation<TLoginResponse, any, { proofKey: string, clientId: string, for_invitation_purpose?: boolean }>({
    mutationFn: async (payload: { proofKey: string, clientId: string, for_invitation_purpose?: boolean }) => {
      const response = await axiosInstance.post<TLoginResponse>(
        `/login/google`,
        {
          client_id: payload.clientId,
          proof_key: payload.proofKey,
          for_invitation_purpose: payload.for_invitation_purpose
        }
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      successCallback(data)
      if (!variables.for_invitation_purpose) {
        updateGlobalsStore({
          authenticated: true,
          user: data.user
        })
      } else {
        updateGlobalsStore({
          invitationRecipient: data.user
        })
      }
    }
  })
}

/**
 * @description Register mutation. On success, it updates the globals store to set the authenticated state to true.
 * @param successCallback - Callback function to handle successful register
 * @returns A mutation object with the register mutation function
 */
export const useRegister = (successCallback: (data: TRegisterResponse) => void) => {

  return useMutation<TRegisterResponse, any, TRegisterPayload>({
    mutationFn: async (payload) => {

      const response: AxiosResponse<TRegisterResponse> = await axiosInstance.post(
        `/register`,
        payload.body
      )

      if (response.status === 201 && successCallback) {
        successCallback(response.data)
      }

      return response.data
    },
    onSuccess: (data, variables) => {
      if (!variables.body.for_invitation_purpose) {
        updateGlobalsStore({
          authenticated: true,
          user: data.user
        })
      } else {
        updateGlobalsStore({
          invitationRecipient: data.user
        })
      }
    }
  })

}

/**
 * @description Authenticate mutation. On success, it calls the success callback function. On error, it calls the error callback function.
 * @param successCallback - Callback function to handle successful authentication
 * @param errorCallback - Callback function to handle authentication error
 * @returns A mutation object with the authenticate mutation function
 */
export const useAuthenticate = (
  successCallback?: () => void,
  errorCallback?: () => void
) => {

  return useMutation<TAuthenticateResponse>({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `/auth`
      )
      return response.data
    },
    onSuccess: (data) => {
      if (successCallback) {
        updateGlobalsStore({
          user: data.user
        })
        successCallback()
      }
    },
    onError: () => {
      if (errorCallback) {
        errorCallback()
      }
    }
  })

}

type TUseLogoutRequestOptions = Partial<UseMutationOptions>

/**
 * @description Logout mutation.
 * @returns A mutation object with the logout mutation function
 */
export const useLogoutRequest = (options?: TUseLogoutRequestOptions) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `/logout`
      )
      return response.data
    },
    onSuccess(data, variables, context) {
      options?.onSuccess?.(data, variables, context)
    },
  })
}