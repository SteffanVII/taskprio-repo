import { ColumnType, Generated } from "kysely";


export interface IUserTable {

    user_id : string,
    email : string,
    firstname : string,
    lastname : string,
    password_hashed : string | null,
    google_user_id : string | null,
    created_at : Generated<Date>,
    last_modified : Generated<Date | null>

}

export interface IUserBase64Table extends IUserTable {}