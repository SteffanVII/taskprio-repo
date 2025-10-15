import { Router, Response } from "express";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { getUserProfile } from "../../database/queries/profile/query.js";
import { Multer } from "multer";
import { IUpdateProfilePhotoRequest } from "./interfaces.js";
import { multerInstance } from "../../app.js";
import { updateProfilePhoto } from "../../database/queries/profile/mutation.js";

export const registerProfileRoutes = ( router : Router ) => {

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
                const profile = await updateProfilePhoto( user_id, parsedCropArea, file );
                res.status(200).json(profile);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
            
        }
    )

}