import { TUpdateProfilePhotoRequestBody } from "@repo/taskprio-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface IUpdateProfilePhotoRequest extends IAuthenticatedRequest {
    body : TUpdateProfilePhotoRequestBody,
    file : Express.Multer.File
}