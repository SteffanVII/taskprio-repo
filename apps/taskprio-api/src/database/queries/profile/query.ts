import { DB, TProfile } from "@repo/taskprio-types";
import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { EDatabaseFunction } from "../../postgresql.js";
import { jsonBuildObject, jsonObjectFrom } from "kysely/helpers/postgres";

export const getUserProfile = async (
    userId : string,
    trx? : Transaction<DB>
) : Promise<TProfile | undefined> => {

    const queryBuilder = trx ? trx.selectFrom( "tp_user.user" ) : taskprioKysely.selectFrom( "tp_user.user" )

    const profile = await queryBuilder
        .select( eb => [
            sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tp_user.user.user_id)`.as( "user_id" ),
            "tp_user.user.email",
            "tp_user.user.firstname",
            "tp_user.user.lastname",
            jsonObjectFrom(
                eb.selectFrom( "tp_user.user_profile_photo" )
                    .select([
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tp_user.user_profile_photo.user_id)`.as( "user_id" ),
                        "tp_user.user_profile_photo.crop_x",
                        "tp_user.user_profile_photo.crop_y",
                        "tp_user.user_profile_photo.crop_width",
                        "tp_user.user_profile_photo.crop_height",
                        "tp_user.user_profile_photo.image_type",
                        "tp_user.user_profile_photo.photo_file_name",
                        "tp_user.user_profile_photo.last_modified"
                    ])
                    .where( "tp_user.user_profile_photo.user_id", "=", eb.ref( "tp_user.user.user_id" ) )
            ).as( "profile_photo" )
        ])
        .where( "tp_user.user.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId}::text)` )
        .executeTakeFirst()

    return profile;

}