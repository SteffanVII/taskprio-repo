import { Selectable } from "kysely"
import { TpUserUser, TpUserUserProfilePhoto } from "../../db"

export type TGetProfileResponseData = TProfile

export type TUpdateProfilePhotoRequestBody = {
    crop_area : { x : number, y : number, width : number, height : number }
}

export type TUpdateProfilePhotoResponseData = TProfile

// Profile

export type TProfile = Pick<Selectable<TpUserUser>, "user_id" | "email" | "firstname" | "lastname"> & {
    profile_photo : TProfilePhoto | null
}

export type TProfilePhoto = Selectable<TpUserUserProfilePhoto>