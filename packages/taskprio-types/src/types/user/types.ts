import { Selectable } from "kysely";
import { TpUserUser } from "../../db"

export type TUser = Selectable<TpUserUser>;

export type TUserSecure = Pick<TUser, "user_id" | "email" | "firstname" | "lastname" | "created_at" | "last_modified" >