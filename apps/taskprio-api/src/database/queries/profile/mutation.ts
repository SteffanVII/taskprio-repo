import { DB, EProfilePhotoSize, TProfile, TProfilePhoto } from "@repo/taskprio-types";
import { sql, Transaction } from "kysely";
import { taskprioKysely } from "../../kysely/kysely.js";
import { uploadProfilePhotoToS3 } from "../../../aws/s3/index.js";
import dotenv from "dotenv";
import { EDatabaseFunction } from "../../postgresql.js";
import { getUserProfile } from "./query.js";
import sharp from "sharp";

dotenv.config();

export const updateProfilePhoto = async (
    userId : string,
    cropArea : { x : number, y : number, width : number, height : number },
    buffer : Buffer,
    trx? : Transaction<DB>
) : Promise<TProfile> => {

    const userProfilePhotoQuery = async ( trx : Transaction<DB> ) => {

        // const dateNow = Date.now()

        // Generate profile photo sizes from the original photo using the crop area data
    
        const image = sharp( buffer ).png()
        const imageToCrop = sharp( buffer ).png()

        const imageMetaData = await image.metadata()
    
        const imageWidth = imageMetaData.width!
        const imageHeight = imageMetaData.height!
    
        const croppedImageWidth = Math.round( imageWidth / 100 * cropArea.width )
        const croppedImageHeight = Math.round( imageHeight / 100 * cropArea.height )
        const croppedImageX = Math.round( imageWidth / 100 * cropArea.x )
        const croppedImageY = Math.round( imageHeight / 100 * cropArea.y )
    
        let croppedImage = imageToCrop
            .extract({
                left : croppedImageX,
                top : croppedImageY,
                width : croppedImageWidth,
                height : croppedImageHeight
            })
            .resize({
                width : Number(EProfilePhotoSize.CROPPED.split("x")[0]),
                height : Number(EProfilePhotoSize.CROPPED.split("x")[1])
            })
            .png()
    
        const originalImageBuffer = await image.toBuffer()

        const croppedImageBuffer = await croppedImage.toBuffer()
    
        const croppedImageMediumBuffer = await croppedImage.resize({
            width : Number(EProfilePhotoSize.CROPPED_MEDIUM.split("x")[0]),
            height : Number(EProfilePhotoSize.CROPPED_MEDIUM.split("x")[1])
        }).toBuffer()
    
        const croppedImageSmallBuffer = await croppedImage.resize({
            width : Number(EProfilePhotoSize.CROPPED_SMALL.split("x")[0]),
            height : Number(EProfilePhotoSize.CROPPED_SMALL.split("x")[1])
        }).toBuffer()
    
        const imageType = "png" as const
    
        const fileNameOriginal = `${ userId }-${ EProfilePhotoSize.ORIGINAL }.${ imageType }`
        const fileNameCropped = `${ userId }-${ EProfilePhotoSize.CROPPED }.${ imageType }`
        const fileNameCroppedMedium = `${ userId }-${ EProfilePhotoSize.CROPPED_MEDIUM }.${ imageType }`
        const fileNameCroppedSmall = `${ userId }-${ EProfilePhotoSize.CROPPED_SMALL }.${ imageType }`

        const originalKey = `${ process.env.TASKPRIO_AWS_S3_BUCKET_PROFILE_PHOTOS_PATH }/${ userId }/${ fileNameOriginal }`
        const croppedKey = `${ process.env.TASKPRIO_AWS_S3_BUCKET_PROFILE_PHOTOS_PATH }/${ userId }/${ fileNameCropped }`
        const croppedMediumKey = `${ process.env.TASKPRIO_AWS_S3_BUCKET_PROFILE_PHOTOS_PATH }/${ userId }/${ fileNameCroppedMedium }`
        const croppedSmallKey = `${ process.env.TASKPRIO_AWS_S3_BUCKET_PROFILE_PHOTOS_PATH }/${ userId }/${ fileNameCroppedSmall }`
    
        const filesToUpdload = [
            { key : originalKey, buffer : originalImageBuffer },
            { key : croppedKey, buffer : croppedImageBuffer },
            { key : croppedMediumKey, buffer : croppedImageMediumBuffer },
            { key : croppedSmallKey, buffer : croppedImageSmallBuffer }
        ]

        // Upload photo to S3
        await uploadProfilePhotoToS3(filesToUpdload)

        await trx.insertInto( "tp_user.user_profile_photo" )
            .values({
                user_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`,
                photo_file_name : fileNameOriginal,
                image_type : imageType,
                crop_x : cropArea.x,
                crop_y : cropArea.y,
                crop_width : cropArea.width,
                crop_height : cropArea.height
            })
            .onConflict( oc => oc.column( "user_id" ).doUpdateSet({
                photo_file_name : fileNameOriginal,
                image_type : imageType,
                crop_x : cropArea.x,
                crop_y : cropArea.y,
                crop_width : cropArea.width,
                crop_height : cropArea.height
            }) )
            .executeTakeFirstOrThrow()
    
        return await getUserProfile( userId )

    }

    if ( trx ) {
        return await userProfilePhotoQuery( trx );
    } else {
        return await taskprioKysely.transaction().execute( async trx => {
            return await userProfilePhotoQuery( trx );
        } );
    }

}

// export const updateProfilePhotoCrop = async (
//     userId : string,
//     file : File,
//     cropArea : { x : number, y : number, width : number, height : number },
//     trx? : Transaction<DB>
// ) : Promise<TProfilePhoto> => {

//     const query = async ( trx : Transaction<DB> ) => {
//         await trx.updateTable( "tp_user.user_profile_photo" )
//             .set({
//                 crop_x : cropArea.x,
//                 crop_y : cropArea.y,
//                 crop_width : cropArea.width,
//                 crop_height : cropArea.height
//             })
//             .where( "user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
//             .executeTakeFirstOrThrow()

//         return await trx.selectFrom( "tp_user.user_profile_photo" )
//                 .select([
//                     sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(tp_user.user_profile_photo.user_id)`.as("user_id"),
//                     "tp_user.user_profile_photo.photo_file_name",
//                     "tp_user.user_profile_photo.image_type",
//                     "tp_user.user_profile_photo.crop_x",
//                     "tp_user.user_profile_photo.crop_y",
//                     "tp_user.user_profile_photo.crop_width",
//                     "tp_user.user_profile_photo.crop_height"
//                 ])
//                 .where( "tp_user.user_profile_photo.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})` )
//                 .executeTakeFirstOrThrow()
//     }

//     if ( trx ) {
//         return await query( trx );
//     } else {
//         return await taskprioKysely.transaction().execute( async trx => {
//             return await query( trx );
//         } )
//     }

// }