export type TUser = {
    user_id : string,
    email : string,
    firstname : string,
    lastname : string,
    password_hashed? : string,
    google_user_id? : string,
    created_at : string,
    last_modified : string
}

export type TUserSecure = Pick<TUser, "user_id" | "email" | "firstname" | "lastname" | "created_at" | "last_modified" >