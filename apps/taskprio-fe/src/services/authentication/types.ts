import { TUserSecure } from "@repo/taskprio-types/src"

export type TLoginPayload = {
    body : TLoginBody
}

export type TLoginBody = {
    email : string,
    password : string,
    for_invitation_purpose? : boolean
}

export type TLoginResponse = {
    message : string,
    access_token : string,
    user : TUserSecure
}

export type TRegisterPayload = {
    body : TRegisterBody
}

export type TRegisterBody = {
    email : string,
    firstname : string,
    lastname : string,
    password : string,
    for_invitation_purpose? : boolean
}


export type TRegisterResponse = {
    message : string,
    access_token : string,
    user : TUserSecure
}

export type TAuthenticateResponse = {
    message : string,
    user : TUserSecure
}