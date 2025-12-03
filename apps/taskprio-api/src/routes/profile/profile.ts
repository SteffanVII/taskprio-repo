import { Router, Response } from "express";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { getUserProfile } from "../../database/queries/profile/query.js";
import { Multer } from "multer";
import { IUpdateProfilePhotoCropRequest, IUpdateProfilePhotoRequest } from "./interfaces.js";
import { multerInstance } from "../../app.js";
import { updateProfilePhoto } from "../../database/queries/profile/mutation.js";
import { getAWSS3 } from "../../aws/index.js";
import { Readable } from "stream";
import { streamToBuffer } from "../../utilities/streamToBuffer.js";

export const registerProfileRoutes = ( router : Router ) => {

    // GET
    // Get profile
    router.get(
        "/",
        async ( req : IAuthenticatedRequest, res : Response ) => {

            const { user_id } = req.user;

            try {
                const profile = await getUserProfile(user_id);

                if ( !profile ) {
                    res.status(404).json({ message : "Profile not found" });
                    return;
                }

                res.status(200).json(profile);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

    // POST
    // Update profile photo
    router.post(
        "/photo",
        multerInstance.single( "photo" ),
        async ( req : IUpdateProfilePhotoRequest, res : Response ) => {

            const { user_id } = req.user;
            const { file } = req;
            const { crop_area } = req.body;

            if ( !crop_area ) {
                res.status(400).json({ message : "Crop area is required" });
                return;
            }

            const parsedCropArea = JSON.parse( crop_area as unknown as string );

            console.log(file);

            if ( !file ) {
                res.status(400).json({ message : "Photo is required" });
                return;
            }

            try {
                const profile = await updateProfilePhoto( user_id, parsedCropArea, file.buffer );
                res.status(200).json(profile);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
            
        }
    )

    // PATCH
    // Update profile crop
    router.patch(
        "/photo/update-crop",
        async ( req : IUpdateProfilePhotoCropRequest, res : Response ) => {

            const { user_id } = req.user
            const { crop_area } = req.body

            try {

                const userProfile = await getUserProfile(user_id);

                const key = `${process.env.TASKPRIO_AWS_S3_BUCKET_PROFILE_PHOTOS_PATH}/${userProfile.user_id}/${userProfile.profile_photo.photo_file_name}`

                console.log(key);

                const objs = await getAWSS3().getObject({
                    Bucket : process.env.TASKPRIO_AWS_S3_BUCKET_NAME,
                    Key : key
                }).promise()

                console.log(typeof objs.Body);

                const body = objs.Body;
                let buffer : Buffer;

                if (Buffer.isBuffer(body)) {
                    buffer = body
                } else if (body instanceof Readable) {
                    buffer = await streamToBuffer(body)
                } else if (typeof body === "string") {
                    buffer = Buffer.from(body)
                } else if (body instanceof Uint8Array) {
                    buffer = Buffer.from(body)
                } else {
                    throw new Error("Unsupported S3 Body type")
                }

                const profile = await updateProfilePhoto( user_id, crop_area, buffer );
                res.status(200).json(profile);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

}