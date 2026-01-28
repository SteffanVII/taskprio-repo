import { Request } from "express";
import { TLoginRequestBody, TRegisterRequestBody } from "@repo/taskprio-types";

export interface ILoginRequest extends Request {
    body: TLoginRequestBody
}

export interface IGoogleLoginRequest extends Request {
    body: {
        proof_key: string,
        client_id: string,
        for_invitation_purpose?: boolean
    },
    user: {
        google_user_id: string,
        email: string,
        email_verified: boolean,
        name: string,
        given_name: string,
        family_name: string,
        picture?: string,
    }
}

export interface IRegisterRequest extends Request {
    body: TRegisterRequestBody
}
