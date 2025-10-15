import { Selectable } from "kysely"
import { InvitationWorkspaceInvitation } from "../../db"

export type TInvitationTokenPayload = {
    sender_id : string,
    email : string,
    workspace_id : string,
    projects : string[]
}

export type TInvitationTokenDecoded = TInvitationTokenPayload & {
    exp : number
}

export type TWorkspaceInvitation = Selectable<InvitationWorkspaceInvitation>;

export type IGetInvitationInfoResponseData = Pick< TInvitationTokenDecoded, "sender_id" | "email" > & {
    is_invitation_exists : boolean,
    is_user_exists : boolean,
    accepted : boolean
}