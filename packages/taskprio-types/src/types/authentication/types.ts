export type TLoginRequestBody = {
    email : string,
    password : string,
    for_invitation_purpose? : boolean
}

export type TRegisterRequestBody = {
    email? : string,
    firstname? : string,
    lastname? : string,
    password? : string,
    for_invitation_purpose? : boolean
}