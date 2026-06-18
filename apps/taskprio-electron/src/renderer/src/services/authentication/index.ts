import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { TAuthenticateResponse, TLoginPayload, TLoginResponse, TRegisterPayload, TRegisterResponse } from "./types"
import { axiosInstance } from "../axios"
import { AxiosResponse } from "axios"
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "@/lib/globals"
import { useGlobalsStore } from "@/stores/globals"

/**
 * @description Login mutation. On success, it updates the globals store to set the authenticated state to true.
 * @param successCallback - Callback function to handle successful login
 * @returns A mutation object with the login mutation function
 */
export const useLogin = (successCallback: (data: TLoginResponse) => void) => {

  const setAuthenticated = useGlobalsStore(state => state.setAuthenticated)
  const setUser = useGlobalsStore(state => state.setUser)
  const setInvitationRecipient = useGlobalsStore(state => state.setInvitationRecipient)

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
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        setAuthenticated(true)
        setUser(data.user)
      } else {
        setInvitationRecipient(data.user)
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
  const setAuthenticated = useGlobalsStore(state => state.setAuthenticated)
  const setUser = useGlobalsStore(state => state.setUser)
  const setInvitationRecipient = useGlobalsStore(state => state.setInvitationRecipient)

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
      if (!variables.for_invitation_purpose) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user))
        setAuthenticated(true)
        setUser(data.user)
      } else {
        setInvitationRecipient(data.user)
      }
      successCallback(data)
    }
  })
}

/**
 * @description Register mutation. On success, it updates the globals store to set the authenticated state to true.
 * @param successCallback - Callback function to handle successful register
 * @returns A mutation object with the register mutation function
 */
export const useRegister = (successCallback: (data: TRegisterResponse) => void) => {

  const setAuthenticated = useGlobalsStore(state => state.setAuthenticated)
  const setUser = useGlobalsStore(state => state.setUser)
  const setInvitationRecipient = useGlobalsStore(state => state.setInvitationRecipient)

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
        setAuthenticated(true)
        setUser(data.user)
      } else {
        setInvitationRecipient(data.user)
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

  const setUser = useGlobalsStore(state => state.setUser)

  return useMutation<TAuthenticateResponse>({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `/auth`
      )
      return response.data
    },
    onSuccess: (data) => {
      if (successCallback) {
        setUser(data.user)
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
    mutationKey: ["logout"],
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