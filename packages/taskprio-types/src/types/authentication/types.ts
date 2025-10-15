import { TUser } from "../user/types"

export type TLoginRequestBody = {
    email : string,
    password : string,
    for_invitation_purpose? : boolean
}

export type TRegisterRequestBody = Partial<Pick<TUser, "email" | "firstname" | "lastname" | "password_hashed">> & {
    password : string,
    for_invitation_purpose? : boolean
}