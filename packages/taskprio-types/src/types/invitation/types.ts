import { Selectable } from "kysely"
import { InvitationWorkspaceInvitation } from "../../db"

export type TInvitationTokenPayload = {
    sender_id: string,
    email: string,
    workspace_id: string,
    projects: string[]
}

export type TInvitationTokenDecoded = TInvitationTokenPayload & {
    exp: number
}

export type TWorkspaceInvitation = Selectable<InvitationWorkspaceInvitation>

export type TWorkspaceInvitationExtended = TWorkspaceInvitation & {
    workspace_name: string,
    sender_email: string,
    sender_firstname: string,
    sender_lastname: string
}

export type TGetInvitationInfoResponseData = Pick<TInvitationTokenDecoded, "sender_id" | "email"> & {
    is_invitation_exists: boolean,
    is_user_exists: boolean,
    accepted: boolean
} & Pick<TWorkspaceInvitationExtended, "workspace_name" | "sender_email" | "sender_firstname" | "sender_lastname">