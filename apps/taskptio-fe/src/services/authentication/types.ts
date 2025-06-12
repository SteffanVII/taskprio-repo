
export type TLoginPayload = {
    body : TLoginBody
}

export type TLoginBody = {
    email : string,
    password : string
}

export type TLoginResponse = {
    message : string,
    access_token : string
}

export type TRegisterPayload = {
    body : TRegisterBody
}

export type TRegisterBody = {
    email : string,
    firstname : string,
    lastname : string,
    password : string
}


export type TRegisterResponse = {
    message : string,
    access_token : string
}