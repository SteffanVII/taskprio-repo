export type TLoginRequestBody = {
    email : string,
    password : string
}

export type TRegisterRequestBody = {
    email? : string,
    firstname? : string,
    lastname? : string,
    password? : string
}